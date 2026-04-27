import { Response } from 'express';

type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage?: number;
};

type TResponse<T> = {
  statusCode: number;
  success?: boolean;
  message?: string;
  meta?: TMeta;
  data?: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data?.statusCode).json({
    success: data?.success || data?.statusCode < 400 ? true : false,
    statusCode: data?.statusCode,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};


const sendResponse2 = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: {
      page: number;
      limit: number;
      total: number;
    };
    data?: T | null | undefined;
  }
) => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta || null || undefined,
    result: jsonData.data || null || undefined,
  });
};

export default sendResponse;
