// database/migrations/xxxx_refresh_tokens.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateRefreshTokens extends BaseSchema {
  protected tableName = 'refresh_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // Refresh token string
      table.string('token').unique().notNullable()

      // Expiration time
      table.timestamp('expires_at').notNullable()

      // Revoke flag (untuk invalidasi token lama)
      table.boolean('revoked').notNullable().defaultTo(false)

      // created_at & updated_at
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
