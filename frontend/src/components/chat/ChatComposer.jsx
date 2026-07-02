import { Button, TextArea } from "@heroui/react";
import {
  ImageIcon,
  LoaderIcon,
  Mic,
  SendHorizontalIcon,
  Square,
  Trash2,
} from "lucide-react";
import { useRef, useEffect } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";

function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  const isRecording = useChatStore((state) => state.isRecording);
  const recordingDuration = useChatStore((state) => state.recordingDuration);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const startRecording = useChatStore((state) => state.startRecording);
  const stopRecording = useChatStore((state) => state.stopRecording);
  const cancelRecording = useChatStore((state) => state.cancelRecording);
  const { activeConversationId } = useSelectedConversation();
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const mediaInputRef = useRef(null);

  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, [cancelRecording]);

  const playSoundIfEnabled = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const handleSend = async () => {
    const didSendMessage = await sendTextMessage(activeConversationId);
    if (didSendMessage) playSoundIfEnabled();
  };

  const handleComposerTextChange = (event) => {
    setComposerText(event.target.value);
    playSoundIfEnabled();
  };

  const handleMediaPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const didSendMessage = await sendMediaMessage(activeConversationId, file);

    if (didSendMessage) playSoundIfEnabled();
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <footer className="shrink-0 border-t border-border px-1.5 pb-2 pt-2 sm:px-2">
      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon
            className="size-4 shrink-0 animate-spin text-accent"
            strokeWidth={2}
            aria-hidden
          />
          <span className="truncate">Uploading media...</span>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        {isRecording ? (
          <>
            <Button
              variant="ghost"
              isIconOnly
              className="size-9 shrink-0 touch-manipulation self-end text-muted"
              onPress={cancelRecording}
            >
              <Trash2 className="size-5 sm:size-6" strokeWidth={2} />
            </Button>
            <div className="flex flex-1 items-center gap-2 self-center rounded-full bg-surface px-4 py-2 text-sm">
              <span className="size-2 animate-pulse rounded-full bg-danger" />
              <span className="tabular-nums font-medium">
                {formatDuration(recordingDuration)}
              </span>
            </div>
            <Button
              variant="ghost"
              isIconOnly
              className="size-9 shrink-0 touch-manipulation self-end text-accent"
              onPress={stopRecording}
            >
              <Square className="size-5 sm:size-6" strokeWidth={2} />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              isIconOnly
              isDisabled={isSendingMedia}
              className="size-9 shrink-0 touch-manipulation self-end text-accent"
              onPress={() => mediaInputRef.current?.click()}
            >
              <ImageIcon className="size-5 sm:size-6" strokeWidth={2} />
            </Button>
            <Button
              variant="ghost"
              isIconOnly
              isDisabled={isSendingMedia}
              className="size-9 shrink-0 touch-manipulation self-end text-accent"
              onPress={startRecording}
            >
              <Mic className="size-5 sm:size-6" strokeWidth={2} />
            </Button>
            <TextArea
              fullWidth
              variant="secondary"
              placeholder="iMessage"
              rows={1}
              value={composerText}
              onChange={handleComposerTextChange}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 rounded-full"
            />
            <Button
              variant="primary"
              isIconOnly
              isDisabled={!composerText.trim()}
              onPress={handleSend}
            >
              <SendHorizontalIcon className="size-5" />
            </Button>
          </>
        )}
      </div>
    </footer>
  );
}

export default ChatComposer;
