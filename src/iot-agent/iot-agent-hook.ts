import { HookContext, HooksObject } from '@feathersjs/feathers';

import { logger } from '../logger';
import { Utility } from '../utility';

import { IRoom } from '../room/room-model';
import { IIotAgent } from './iot-agent-model';

export const iotAgentHooks: Partial<HooksObject> = {
  before: {
    async create(context: HookContext<IIotAgent>) {
      const data = context.data;
      const params = context.params;
      const { roomId }: { roomId: string } = <any>params.query;

      const room: IRoom = await context.app.service('rooms').get(roomId);
      const agentId = Utility.generateId(roomId, data.site);

      // #region Validation
      if (room === undefined) {
        const message =
          'Given device group does not exist. Try different group or create one';
        logger.warn(message, { device: data, room });
        throw new Error(message);
      }

      if (await Utility.isChild(agentId, context.service, { roomId })) {
        const message = 'Agent already exists for given room';
        logger.warn(message, { device: data, room });
        throw new Error(message);
      }
      // #endregion

      // Add reverse reference
      data.roomId = roomId;

      data._id = agentId;

      return context;
    }
  }
};
