import type { RequestHandler } from "express";

export const createShortUrl: RequestHandler = async (req, res) => {};

export const redirectToOriginalUrl: RequestHandler = async (req, res) => {};

export const getUrlByShortCode: RequestHandler = async (req, res) => {};

export const getAllUrls: RequestHandler = async (req, res) => {};

export const updateUrl: RequestHandler = async (req, res) => {};

export const deleteUrl: RequestHandler = async (req, res) => {};

export const getUrlAnalytics: RequestHandler = async (req, res) => {};
