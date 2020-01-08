import React from "react";
import ShadowAPI from "./utils/shadow";
import ShadowSubscriptions from "./components/Shadow";

const eve_shadow = new ShadowAPI();

export default function App(props) {
  return (
    <>
      <button onClick={() => eve_shadow.publish_topic("daemon/vww/start")}>
        Turn on Camera
      </button>
      <button onClick={() => eve_shadow.publish_topic("daemon/vww/stop")}>
        Turn off Camera
      </button>

      <button onClick={() => eve_shadow.publish_get_shadow()}>Get</button>
      <button
        onClick={() =>
          eve_shadow.publish_update_shadow({
            state: {
              reported: {
                color: "nice!"
              }
            }
          })
        }
      >
        Update
      </button>
      <button onClick={() => eve_shadow.publish_delete_shadow()}>Delete</button>
      <ShadowSubscriptions shadow={eve_shadow} />
    </>
  );
}
