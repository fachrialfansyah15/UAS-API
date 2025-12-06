import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class RefreshToken extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public userId!: number

  @column()
  public token!: string

  @column.dateTime()
  public expiresAt!: DateTime

  @column()
  public revoked!: boolean
}
