import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req[source] = schema.parse(req[source])
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: '参数校验失败', details: err.errors })
        return
      }
      next(err)
    }
  }
}
