import { test } from 'node:test'
import assert from 'node:assert'
import { HealthCheck } from '../../src/application/features/health/HealthCheck'

test('HealthCheck returns ok when all pings succeed', async () => {
  const check = new HealthCheck(
    async () => {},
    async () => {}
  )

  const report = await check.execute()
  assert.strictEqual(report.status, 'ok')
  assert.strictEqual(report.checks.database, 'ok')
  assert.strictEqual(report.checks.aiGateway, 'ok')
})

test('HealthCheck returns degraded when a ping fails', async () => {
  const check = new HealthCheck(
    async () => {},
    async () => {
      throw new Error('Timeout')
    }
  )

  const report = await check.execute()
  assert.strictEqual(report.status, 'degraded')
  assert.strictEqual(report.checks.database, 'ok')
  assert.strictEqual(report.checks.aiGateway, 'down')
})
