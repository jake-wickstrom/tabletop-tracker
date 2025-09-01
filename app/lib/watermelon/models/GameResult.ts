import { Model, type Relation } from '@nozbe/watermelondb'
import { date, field, relation, text } from '@nozbe/watermelondb/decorators'
import type { GameSession } from './GameSession'
import type { Player } from './Player'

export class GameResult extends Model {
  static table = 'game_results'

  @field('session_id') sessionId!: string
  @relation('game_sessions', 'session_id') session!: Relation<GameSession>
  @field('player_id') playerId!: string
  @relation('players', 'player_id') player!: Relation<Player>
  @field('score') score!: number
  @field('position') position!: number
  @field('is_winner') isWinner!: boolean
  @text('notes') notes: string | undefined
  @date('created_at') createdAt!: number
  @date('updated_at') updatedAt!: number
  @date('deleted_at') deletedAt: number | undefined
}


