import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { randomUUID } from 'crypto'

export default class AuthController {
  // =====================================================
  // LOGIN
  // =====================================================
  public async login({ auth, request, response }: HttpContext) {
    const data = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(data.email, data.password)

      // Access Token (2 jam)
      const accessToken = await auth.use('api').createToken(user, [], {
        expiresIn: '2 hours',
      })

      // Refresh token (2 jam)
      const refreshToken = await RefreshToken.create({
        userId: user.id,
        token: randomUUID(),
        expiresAt: DateTime.now().plus({ hours: 2 }),
      })

      return response.ok({
        access_token: accessToken.value,
        refresh_token: refreshToken.token,
      })
    } catch (error) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  // =====================================================
  // REGISTER
  // =====================================================
  public async register({ auth, request, response }: HttpContext) {
    const data = request.only(['name', 'email', 'password'])

    try {
      const user = await User.create(data)

      // Access Token (2 jam)
      const accessToken = await auth.use('api').createToken(user, [], {
        expiresIn: '2 hours',
      })

      // Refresh Token (2 jam)
      const refreshToken = await RefreshToken.create({
        userId: user.id,
        token: randomUUID(),
        expiresAt: DateTime.now().plus({ hours: 2 }),
      })

      user.refresh()

      return response.ok({
        user,
        access_token: accessToken.value,
        refresh_token: refreshToken.token,
      })
    } catch (error) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  // =====================================================
  // REFRESH TOKEN
  // =====================================================
  public async refresh({ request, response, auth }: HttpContext) {
    const oldToken = request.input('refresh_token')

    if (!oldToken) {
      return response.badRequest({ message: 'Refresh token is required' })
    }

    // Cari refresh token di database
    const stored = await RefreshToken
      .query()
      .where('token', oldToken)
      .where('revoked', false)
      .first()

    if (!stored) {
      return response.unauthorized({ message: 'Invalid refresh token' })
    }

    // Cek expired (lebih dari 2 jam)
    if (stored.expiresAt < DateTime.now()) {
      return response.unauthorized({ message: 'Refresh token expired' })
    }

    const user = await User.findOrFail(stored.userId)

    // Buat access token baru (2 jam)
    const newAccessToken = await auth.use('api').createToken(user, [], {
      expiresIn: '2 hours',
    })

    // Revoke refresh token lama
    stored.revoked = true
    await stored.save()

    // Refresh token baru (2 jam)
    const newRefreshToken = await RefreshToken.create({
      userId: user.id,
      token: randomUUID(),
      expiresAt: DateTime.now().plus({ hours: 2 }),
    })

    return response.ok({
      access_token: newAccessToken.value,
      refresh_token: newRefreshToken.token,
    })
  }
}
