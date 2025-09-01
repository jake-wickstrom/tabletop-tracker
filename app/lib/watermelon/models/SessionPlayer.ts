import { Model, type Relation } from '@nozbe/watermelondb'
import { date, field, relation } from '@nozbe/watermelondb/decorators'
import type { GameSession } from './GameSession'
import type { Player } from './Player'

export class SessionPlayer extends Model {
  static table = 'session_players'

  @relation('game_sessions', 'session_id') session!: Relation<GameSession>
  @relation('players', 'player_id') player!: Relation<Player>
  @field('player_order') playerOrder!: number
  @date('created_at') createdAt!: number
}


