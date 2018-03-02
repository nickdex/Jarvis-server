import { Request, Response } from 'express';
import { error, log } from 'util';

import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { Device } from '../model/device';
import { DeviceService } from '../service';

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('home');
};

export const devices = async (req: Request, res: Response) => {
  res.json(await DeviceService.find());
};

const getPayload = (data: Device): IotPayload => {
  const payload = new IotPayload();
  payload.device = data._id;
  payload.action = data.isOn ? 'on' : 'off';

  return payload;
};

export let iot = (req: Request, res: Response) => {
  const payload: IotPayload = getPayload(req.body);

  const iotDevice = new IotDevice();

  // DB Update
  const isOn = payload.action === 'on';
  DeviceService.patch(payload.device, { isOn: isOn })
    .then(item => {
      log(`DB Update: ${JSON.stringify(item)}`);
      res.json(item);
    })
    .catch(reason => error(`DB update failed: ${reason}`));

  iotDevice.send(payload).catch(reason => {
    console.error(`Sending to IOT failed\n${reason}`);
  });
};
