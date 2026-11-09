declare module "web-push" {
  const webpush: {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    sendNotification(subscription: any, payload: string, options?: { TTL?: number }): Promise<any>;
  };
  export default webpush;
}
