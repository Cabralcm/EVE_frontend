import Amplify, { PubSub } from "aws-amplify";
import configure_amplify from "./amplify";

export default class ShadowAPI {
  constructor(thing = "EVE_Core") {
    configure_amplify();
    this.thing = thing;
    // Data Stores
    // {topic: subscription}
    this.subscriptions = {};
  }

  // Getters
  get_current_subscribed_topics = () => {
    return Object.keys(this.subscriptions);
  };

  get_shadow_topics = () => {
    const topics = ["delete", "get", "update"];
    const results = ["accepted", "rejected"];

    const shadow_topics = [];
    for (const topic of topics) {
      for (const result of results) {
        shadow_topics.push(`${topic}/${result}`);
      }
    }
    return shadow_topics;
  };

  // Utilities
  log_topic_error_msg = (topic, error) => {
    console.error(`Error on topic: ${topic}\n${JSON.stringify(error)}`);
  };
  log_topic_action_msg = (topic, action) => {
    console.log(`${action}: '${topic}' for '${this.thing}'`);
  };

  // Subscriptions
  subscribe_shadow_topics = (topics, callback_fn) => {
    for (const topic of topics) {
      this.subscribe_shadow_topic(topic, callback_fn);
    }
  };

  subscribe_shadow_topic = (topic, callback_fn) => {
    const full_topic = `$aws/things/${this.thing}/shadow/${topic}`;
    const subscription = Amplify.PubSub.subscribe(full_topic).subscribe({
      next: ({ value }) => {
        callback_fn({ [topic]: value });
      },
      error: error => {
        callback_fn({ [topic]: null });
        this.log_topic_error_msg(full_topic, error);
      },
      close: () => {
        console.log(`Closing subscription on ${full_topic}`);
      }
    });

    this.subscriptions[topic] = subscription;
    this.log_topic_action_msg(full_topic, "Subscribe");
  };

  unsubscribe_shadow_topics = topics => {
    for (const topic of topics) {
      this.unsubscribe_shadow_topic(topic);
    }
  };

  unsubscribe_shadow_topic = topic => {
    if (!(topic in this.subscriptions)) {
      console.warn(`Unsubscribe: topic '${topic} doesn't exist!`);
      return;
    }
    this.subscriptions[topic].unsubscribe();
    delete this.subscriptions[topic];
    this.log_topic_action_msg(topic, "Unsubscribe");
  };

  // Publish
  publish_delete_shadow = async () => {
    const full_topic = `$aws/things/${this.thing}/shadow/delete`;
    this.publish_topic(full_topic);
  };

  publish_get_shadow = async () => {
    const full_topic = `$aws/things/${this.thing}/shadow/get`;
    try {
      await PubSub.publish(full_topic, {});
    } catch (error) {
      this.log_topic_error_msg(full_topic, error);
      return;
    }
    this.publish_topic(full_topic);
  };

  publish_update_shadow = async state => {
    const full_topic = `$aws/things/${this.thing}/shadow/update`;
    this.publish_topic(full_topic, state);
  };

  publish_topic = async (topic, data = {}) => {
    try {
      await PubSub.publish(topic, data);
    } catch (error) {
      this.log_topic_error_msg(topic, error);
      return;
    }
    this.log_topic_action_msg(topic, "Publish");
  };
}
