import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import { DateTime } from 'luxon'
import crypto from 'crypto'

export default class AuthController {
  // REGISTER
  public async register({ request, response }: HttpContext) {
    const data = request.only(['name', 'email', 'password'])

    const user = await User.create(data)

    const accessToken = await User.accessTokens.create(user)

    const refreshToken = crypto.randomUUID()

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: DateTime.now().plus({ days: 7 }),
      revoked: false,
    })

    return response.created({
      user,
      access_token: accessToken.value!.release(),
      refresh_token: refreshToken,
    })
  }

  // LOGIN
  public async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)

    const accessToken = await User.accessTokens.create(user)

    const refreshToken = crypto.randomUUID()

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: DateTime.now().plus({ days: 7 }),
      revoked: false,
    })

    return response.ok({
      user,
      access_token: accessToken.value!.release(),
      refresh_token: refreshToken,
    })
  }

  // REFRESH
  public async refresh({ request, response }: HttpContext) {
    const oldRefresh = request.input('refresh_token')

    if (!oldRefresh) {
      return response.badRequest({ message: 'Refresh token is required' })
    }

    const stored = await RefreshToken
      .query()
      .where('token', oldRefresh)
      .where('revoked', false)
      .first()

    if (!stored) {
      return response.unauthorized({ message: 'Invalid refresh token' })
    }

    if (stored.expiresAt < DateTime.now()) {
      return response.unauthorized({ message: 'Refresh token expired' })
    }

    const user = await User.findOrFail(stored.userId)

    const newAccessToken = await User.accessTokens.create(user)

    stored.revoked = true
    await stored.save()

    const newRefresh = crypto.randomUUID()

    await RefreshToken.create({
      userId: user.id,
      token: newRefresh,
      expiresAt: DateTime.now().plus({ days: 7 }),
      revoked: false,
    })

    return response.ok({
      access_token: newAccessToken.value!.release(),
      refresh_token: newRefresh,
    })
  }
}
