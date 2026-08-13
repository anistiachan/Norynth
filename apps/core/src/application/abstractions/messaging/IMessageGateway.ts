export interface IMessageGateway {
  sendMessage(externalChatId: string, text: string): Promise<void>
}
