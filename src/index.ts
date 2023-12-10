import { Client, Events, TextChannel } from "discord.js";
import { ActivityStatus } from "./ActivityMsg";
import { IntentOptions } from "./config/IntentOptions";
import { VoiceStateUpdateHandler } from "./handlers/VoiceStateUpdateHandler";
import { VoiceActivity } from "./VoiceActivity";

(async () => {
  const eave = new Client({ intents: IntentOptions });
  const updateHandler = new VoiceStateUpdateHandler(new VoiceActivity());

  eave.on(Events.ClientReady, async () => {
    console.log("Connected");

    const channel = (await eave.channels.fetch(
      process.env.CHANNEL_ID || "unwrap"
    )) as TextChannel;

    if (!channel) {
      // TODO: Use a logger.
      console.log("The server does not have a channel with that id.");
      return;
    }

    updateHandler.setChannel(channel);

    setInterval(() => {
      const duration = updateHandler.activityDuration();
      const activity = new ActivityStatus(duration);

      console.log(`Message: ${activity.msg}`);

      // FIXME: Don't wait for a minute to set the status.
      eave.user?.setActivity(activity.msg, {
        type: activity.name,
        name: "Maybe",
      });
      eave.user?.setStatus(activity.status);
    }, 60000);
  });

  eave.on(Events.VoiceStateUpdate, updateHandler.handle.bind(updateHandler));

  await eave.login(process.env.BOT_TOKEN);
})();

// TODO: Account for disconnects due to bad internet.
