/** `plain` placeholders also work in plain-text embed fields. Mentions and timestamps don't. */
export interface Placeholder {
    token: string;
    label: string;
    description: string;
    group: "Content" | "Channel" | "Pings";
    plain: boolean;
}

export const PLACEHOLDERS: Placeholder[] = [
    { token: "{video.title}", label: "Title", description: "The video or stream title", group: "Content", plain: true },
    { token: "{video.link}", label: "Link", description: "Link to the video or stream (wrap it in < > to skip Discord's link preview)", group: "Content", plain: true },
    { token: "{video.type}", label: "Type", description: "live, video, premiere, shorts or members", group: "Content", plain: true },
    { token: "{video.description}", label: "Description", description: "First line of the description", group: "Content", plain: true },
    { token: "{video.thumbnail}", label: "Thumbnail", description: "Link to the thumbnail image", group: "Content", plain: true },
    { token: "{video.category}", label: "Category", description: "Game or category being streamed", group: "Content", plain: true },
    { token: "{video.uploadedAgo}", label: "Uploaded ago", description: "Relative time, like \"5 minutes ago\"", group: "Content", plain: false },
    { token: "{video.uploadedAt}", label: "Uploaded at", description: "Date & time, shown in each member's timezone", group: "Content", plain: false },
    { token: "{video.id}", label: "Id", description: "The video or stream id", group: "Content", plain: true },
    { token: "{channel.name}", label: "Name", description: "The creator's display name", group: "Channel", plain: true },
    { token: "{channel.handle}", label: "Handle", description: "The creator's @handle", group: "Channel", plain: true },
    { token: "{channel.avatar}", label: "Avatar", description: "Link to the creator's avatar", group: "Channel", plain: true },
    { token: "{channel.link}", label: "Link", description: "Link to the creator's channel", group: "Channel", plain: true },
    { token: "{channel.platform}", label: "Platform", description: "YouTube, Twitch or Kick", group: "Channel", plain: true },
    { token: "{role.pingrole}", label: "Ping role", description: "Mentions the ping roles of this kind of post, set above", group: "Pings", plain: false },
    { token: "{role.everyone}", label: "@everyone", description: "Mentions everyone in the server", group: "Pings", plain: false },
    { token: "{role.here}", label: "@here", description: "Mentions everyone who's online", group: "Pings", plain: false }
];

export const COUNTER_PLACEHOLDERS: Placeholder[] = [
    { token: "{count}", label: "Count", description: "The number, shortened (128.4K)", group: "Content", plain: true },
    { token: "{count.exact}", label: "Exact count", description: "The full number (128,400)", group: "Content", plain: true },
    { token: "{name}", label: "Name", description: "The creator's name", group: "Channel", plain: true },
    { token: "{platform}", label: "Platform", description: "YouTube, Twitch or Kick", group: "Channel", plain: true },
    { token: "{metric}", label: "Metric", description: "Subscribers, Followers, Videos or Views", group: "Content", plain: true }
];
