import { Model } from '@nozbe/watermelondb'
import { date, field, text } from '@nozbe/watermelondb/decorators'

export class Game extends Model {
  static table = 'games'

  @text('name') name!: string
  @text('description') description: string | undefined
  @field('min_players') minPlayers!: number
  @field('max_players') maxPlayers!: number
  @field('estimated_playtime_minutes') estimatedPlaytimeMinutes!: number
  @field('complexity_rating') complexityRating!: number
  @date('created_at') createdAt!: number
  @date('updated_at') updatedAt!: number
  @date('deleted_at') deletedAt: number | undefined
}


