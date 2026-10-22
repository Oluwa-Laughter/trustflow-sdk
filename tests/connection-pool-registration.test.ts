import axios from 'axios';
import { TrustFlowClient } from '../src/client';
import { createHttpAgent, createHttpsAgent, configureAxiosConnectionPool } from '../src/node/agents';
import { destroyAllPoolAgents, destroyPoolAgent } from '../src/utils/connection-pool';

describe('Node pool registry lifecycle (#547)', () => {
  afterEach(() => {
    destroyAllPoolAgents();
    jest.restoreAllMocks();
  });

  it('destroys both agents created by the public factories on client disconnect', async () => {
    const http = createHttpAgent();
    const https = createHttpsAgent();
    const destroyHttp = jest.spyOn(http, 'destroy');
    const destroyHttps = jest.spyOn(https, 'destroy');

    const client = new TrustFlowClient({ contractId: 'test-contract' });
    await client.disconnect();

    expect(destroyHttp).toHaveBeenCalledTimes(1);
    expect(destroyHttps).toHaveBeenCalledTimes(1);
    destroyAllPoolAgents();
    expect(destroyHttp).toHaveBeenCalledTimes(1);
    expect(destroyHttps).toHaveBeenCalledTimes(1);
  });

  it('unregisters an explicitly destroyed agent to prevent repeat destruction', () => {
    const agent = createHttpAgent();
    const destroy = jest.spyOn(agent, 'destroy');

    destroyPoolAgent(agent);
    destroyAllPoolAgents();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys and unregisters the old agents when an axios pool is reconfigured', () => {
    const instance = axios.create();
    configureAxiosConnectionPool(instance);
    const previousHttp = instance.defaults.httpAgent as ReturnType<typeof createHttpAgent>;
    const previousHttps = instance.defaults.httpsAgent as ReturnType<typeof createHttpsAgent>;
    const destroyHttp = jest.spyOn(previousHttp, 'destroy');
    const destroyHttps = jest.spyOn(previousHttps, 'destroy');

    configureAxiosConnectionPool(instance, { maxSockets: 10 });
    expect(destroyHttp).toHaveBeenCalledTimes(1);
    expect(destroyHttps).toHaveBeenCalledTimes(1);

    destroyAllPoolAgents();
    expect(destroyHttp).toHaveBeenCalledTimes(1);
    expect(destroyHttps).toHaveBeenCalledTimes(1);
  });
});
