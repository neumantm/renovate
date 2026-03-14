import { logger } from '../../../logger/index.ts';
import { getEnv } from '../../../util/env.ts';
import { getMR } from './merge-request.ts';
import { gitlabApi } from './http.ts';

export async function addToMergeTrain(
  repository: string,
  mrIid: number,
): Promise<void> {
  logger.debug(`addToMergeTrain(${mrIid})`);
  const mr = await getMR(repository, mrIid);

  await gitlabApi.postJson(`projects/${repository}/merge_trains/merge_requests/${mrIid}`, {
    body: {
      sha: mr.sha,
    }
  });
}

export async function addToMergeTrainWhenPipelineSucceeds(
  repository: string,
  mrIid: number,
): Promise<void> {
  logger.debug(`addToMergeTrainWhenPipelineSucceeds(${mrIid})`);
  const mr = await getMR(repository, mrIid);

  await gitlabApi.postJson(`projects/${repository}/merge_trains/merge_requests/${mrIid}`, {
    body: {
      sha: mr.sha,
      auto_merge: true,
    }
  });
}


export function shouldUseMergeTrain(isMergeTrainEnabledOnRepo: boolean): boolean {
  const env = getEnv();
  if (env.RENOVATE_X_GITLAB_USE_MERGE_TRAIN_WHEN_AVAILABLE !== 'true') {
    logger.debug(`shouldUseMergeTrain=false because RENOVATE_X_GITLAB_USE_MERGE_TRAIN_WHEN_AVAILABLE is not set to 'true'`);
    return false;
  }
  logger.debug(`shouldUseMergeTrain=${isMergeTrainEnabledOnRepo} based on repository settings`);
  return isMergeTrainEnabledOnRepo;
}
