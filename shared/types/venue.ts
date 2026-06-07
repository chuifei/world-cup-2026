import { z } from 'zod'

export interface Venue {
  id: string
  name: string
  city: string
  country: string
  capacity: number
  imageUrl?: string
  matches: number
  description: string
}

export const VenueParamsSchema = z.object({
  id: z.string().min(1),
})
