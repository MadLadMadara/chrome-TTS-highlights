const ttsConfig = {
    eventsWhiteList: [
        "start",
        "end",
        "word",
        "error",
        "interrupted",
        "cancelled",
    ],
};

const contextMenuConfig = {
    select: {
        id: "select",
        title: "Read selection aloud",
        type: "normal",
        contexts: ["selection"],
        documentUrlPatterns: ["*://*/*"],
    },
    stop: {
        id: "stop",
        title: "Stop reading",
        type: "normal",
        contexts: ["all"],
    },
};

export { ttsConfig, contextMenuConfig };
