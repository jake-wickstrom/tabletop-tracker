import { Model, type Relation, type Query } from '@nozbe/watermelondb'
import { children, date, relation, text } from '@nozbe/watermelondb/decorators'
import type { Game } from './Game'
import type { SessionPlayer } from './SessionPlayer'
import type { GameResult } from './GameResult'

export class GameSession extends Model {
  static table = 'game_sessions'

  @relation('games', 'game_id') game!: Relation<Game>
  @text('session_date') sessionDate!: string
  @text('location') location: string | undefined
  @text('notes') notes: string | undefined
  @date('created_at') createdAt!: number
  @date('updated_at') updatedAt!: number
  @date('deleted_at') deletedAt: number | undefined

  @children('session_players') sessionPlayers!: Query<SessionPlayer>
  @children('game_results') gameResults!: Query<GameResult>
}


