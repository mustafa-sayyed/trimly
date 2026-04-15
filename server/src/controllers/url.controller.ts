import type { RequestHandler } from "express";
import { prisma } from "../db/index.js";
import { config } from "../config/config.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { generateUniqueShortCode } from "../utils/uniqueShortCode.util.js";
import httpStatusCodes from "../utils/httpStatusCodes.util.js";
import type { AuthenticatedRequest } from "../types.js";
import { redis, redisKeys, CACHE_TTL } from "../services/redis.js";
import { UAParser } from "ua-parser-js";
import { getAnalyticsQueue } from "../services/bullmq.js";

export const createShortUrl: RequestHandler = asyncHandler(async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { url, customShortCode, expiresAt } = req.body;

  if (customShortCode) {
    // Check if custom short code is already in use
    const existingUrl = await prisma.url.findUnique({
      where: { short_url: customShortCode },
    });

    if (existingUrl) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Custom short code is already in use" });
    }

    const newUrl = await prisma.url.create({
      data: {
        long_url: url,
        short_url: customShortCode,
        expires_at: expiresAt,
        user_id: user.id,
      },
    });

    await redis.del(redisKeys.allUrls(user.id));

    return res.status(httpStatusCodes.CREATED).json({
      success: true,
      message: "Short URL created successfully",
      shortUrl: `${config.BASE_URL}/${newUrl.short_url}`,
      expiresAt: newUrl.expires_at,
    });
  }

  // Create new short URL
  const newUnqiueShortCode = generateUniqueShortCode();

  const newUrl = await prisma.url.create({
    data: {
      long_url: url,
      short_url: newUnqiueShortCode,
      expires_at: expiresAt,
      user_id: user.id,
    },
  });

  await redis.del(redisKeys.allUrls(user.id));

  return res.status(httpStatusCodes.CREATED).json({
    success: true,
    message: "Short URL created successfully",
    shortUrl: `${config.BASE_URL}/${newUrl.short_url}`,
    expiresAt: newUrl.expires_at,
  });
});

export const redirectToOriginalUrl: RequestHandler = async (req, res) => {
  const { shortCode } = req.params;
  const cacheKey = redisKeys.url(shortCode as string);

  // Check cache first
  const cached = await redis.get(cacheKey);
  let urlEntry = null;

  if (cached) {
    urlEntry = JSON.parse(cached);
  } else {
    // Cache miss - fetch DB
    urlEntry = await prisma.url.findUnique({
      where: { short_url: shortCode as string },
    });

    if (urlEntry) {
      // Cache the result
      await redis.setex(
        cacheKey,
        CACHE_TTL.SHORT_CODE_REDIRECT,
        JSON.stringify(urlEntry),
      );
    }
  }

  if (!urlEntry) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ message: "Short URL not found" });
  }

  if (urlEntry.expires_at && urlEntry.expires_at < new Date()) {
    await redis.del(cacheKey);
    return res
      .status(httpStatusCodes.FORBIDDEN)
      .json({ message: "Short URL has expired" });
  }

  const parsedUserAgent = UAParser(req.headers["user-agent"]);

  const analyticsQueue = getAnalyticsQueue();
  await analyticsQueue.add(`Add Analytics for ${urlEntry.long_url}`, {
    data: {
      click_at: new Date(),
      url_id: urlEntry.id,
      ip_address: req.ip || null,
      user_agent: parsedUserAgent.browser.name || null,
      referrer: req.get("Referrer") || null,
    },
  });

  return res.status(302).redirect(urlEntry.long_url);
};

export const getUrlByShortCode: RequestHandler = async (req, res) => {
  const { shortCode } = req.params;
  const cacheKey = redisKeys.url(shortCode as string);

  // Check cache first
  const cached = await redis.get(cacheKey);
  let urlEntry = null;

  if (cached) {
    urlEntry = JSON.parse(cached);
  } else {
    urlEntry = await prisma.url.findUnique({
      where: { short_url: shortCode as string },
    });

    if (urlEntry) {
      await redis.setex(
        cacheKey,
        CACHE_TTL.URL_DETAILS,
        JSON.stringify(urlEntry),
      );
    }
  }

  if (!urlEntry) {
    return res.status(404).json({ message: "Short URL not found" });
  }

  return res.status(httpStatusCodes.OK).json({
    success: true,
    url: {
      id: urlEntry.id,
      longUrl: urlEntry.long_url,
      shortUrl: `${config.BASE_URL}/${urlEntry.short_url}`,
      expiresAt: urlEntry.expires_at,
      createdAt: urlEntry.created_at,
    },
  });
};

export const getAllUrls: RequestHandler = asyncHandler(async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  const cacheKey = redisKeys.allUrls(user.id);
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.status(httpStatusCodes.OK).json({
      success: true,
      urls: JSON.parse(cached),
    });
  }

  const urls = await prisma.url.findMany({
    where: { user_id: user.id },
  });

  if (!urls || urls.length === 0) {
    return res.status(httpStatusCodes.OK).json({
      success: true,
      message: "No URLs found",
      urls: [],
    });
  }

  const formattedUrls = urls.map((url) => ({
    id: url.id,
    longUrl: url.long_url,
    shortUrl: `${config.BASE_URL}/${url.short_url}`,
    expiresAt: url.expires_at,
    createdAt: url.created_at,
  }));

  // Cache the result
  await redis.setex(
    cacheKey,
    CACHE_TTL.USER_URLS,
    JSON.stringify(formattedUrls),
  );

  return res.status(httpStatusCodes.OK).json({
    success: true,
    urls: formattedUrls,
  });
});

export const updateUrl: RequestHandler = asyncHandler(async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { shortCode } = req.params;
  const { long_url, expires_at } = req.body;

  const url = await prisma.url.findUnique({
    where: { short_url: shortCode as string },
  });

  if (!url) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ message: "Short URL not found" });
  }

  if (url.user_id !== user.id) {
    return res.status(httpStatusCodes.FORBIDDEN).json({
      message: "Forbidden: You do not have permission to update this URL",
    });
  }

  const updatedUrl = await prisma.url.update({
    where: { short_url: shortCode as string },
    data: {
      long_url,
      expires_at,
    },
  });

  await redis.del(redisKeys.url(shortCode as string));
  await redis.del(redisKeys.allUrls(user.id));

  return res.status(httpStatusCodes.OK).json({
    success: true,
    message: "Short URL updated successfully",
    url: {
      id: updatedUrl.id,
      longUrl: updatedUrl.long_url,
      shortUrl: `${config.BASE_URL}/${updatedUrl.short_url}`,
      expiresAt: updatedUrl.expires_at,
      createdAt: updatedUrl.created_at,
    },
  });
});

export const deleteUrl: RequestHandler = asyncHandler(async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { shortCode } = req.params;

  const url = await prisma.url.findUnique({
    where: { short_url: shortCode as string },
  });

  if (!url) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ message: "Short URL not found" });
  }

  if (url.user_id !== user.id) {
    return res.status(httpStatusCodes.FORBIDDEN).json({
      message: "Forbidden: You do not have permission to delete this URL",
    });
  }

  await prisma.url.delete({
    where: { short_url: shortCode as string },
  });

  await redis.del(redisKeys.url(shortCode as string));
  await redis.del(redisKeys.allUrls(user.id));

  return res.status(httpStatusCodes.OK).json({
    success: true,
    message: "Short URL deleted successfully",
  });
});

export const getUrlAnalytics: RequestHandler = asyncHandler(
  async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { shortCode } = req.params;

    const url = await prisma.url.findUnique({
      where: { short_url: shortCode as string },
    });

    if (!url) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: "Short URL not found" });
    }

    if (url.user_id !== user.id) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        message:
          "Forbidden: You do not have permission to view analytics for this URL",
      });
    }

    const cacheKey = redisKeys.analytics(shortCode as string);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.status(httpStatusCodes.OK).json({
        success: true,
        analytics: JSON.parse(cached),
      });
    }

    const analytics = await prisma.analytics.findMany({
      where: { url_id: url.id },
      orderBy: { click_at: "desc" },
    });

    if (!analytics || analytics.length === 0) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "No analytics found for this URL",
      });
    }

    const formattedAnalytics = analytics.map((entry) => ({
      clickAt: entry.click_at,
      ipAddress: entry.ip_address,
      userAgent: entry.user_agent,
      referrer: entry.referrer,
    }));

    // Cache the analytics data
    await redis.setex(
      cacheKey,
      CACHE_TTL.ANALYTICS,
      JSON.stringify(formattedAnalytics),
    );

    return res.status(httpStatusCodes.OK).json({
      success: true,
      analytics: formattedAnalytics,
    });
  },
);
