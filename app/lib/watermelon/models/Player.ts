import { Model } from '@nozbe/watermelondb'
import { date, text } from '@nozbe/watermelondb/decorators'

export class Player extends Model {
  static table = 'players'

  @text('name') name!: string
  @text('email') email: string | undefined
  @date('created_at') createdAt!: number
  @date('updated_at') updatedAt!: number
  @date('deleted_at') deletedAt: number | undefined
}


