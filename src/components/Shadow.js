import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ShadowAPI from "../utils/shadow";

function useShadowSubscriptions(shadow) {
  const [subscriptions, setSubscriptions] = useState(null);

  useEffect(() => {
    shadow.subscribe_shadow_topics(shadow.get_shadow_topics(), data =>
      setSubscriptions(prev => {
        return { ...prev, ...data };
      })
    );
    // Specify how to clean up after this effect:
    return () => {
      shadow.unsubscribe_shadow_topics(shadow.get_shadow_topics());
    };
  }, [shadow]);

  return subscriptions;
}

export default function ShadowSubscriptions({ shadow }) {
  const data = useShadowSubscriptions(shadow);

  return (
    <ul>
      {shadow.get_shadow_topics().map(topic => (
        <li key={topic}>
          <h1>{topic}</h1>
          {data !== null && <p>{JSON.stringify(data[topic])}</p>}
        </li>
      ))}
    </ul>
  );
}
ShadowSubscriptions.propTypes = {
  shadow: PropTypes.instanceOf(ShadowAPI).isRequired
};
