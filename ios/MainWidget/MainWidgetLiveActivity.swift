//
//  MainWidgetLiveActivity.swift
//  MainWidget
//
//  Created by Artem Afonin on 29.03.2025.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct MainWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct MainWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MainWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension MainWidgetAttributes {
    fileprivate static var preview: MainWidgetAttributes {
        MainWidgetAttributes(name: "World")
    }
}

extension MainWidgetAttributes.ContentState {
    fileprivate static var smiley: MainWidgetAttributes.ContentState {
        MainWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: MainWidgetAttributes.ContentState {
         MainWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: MainWidgetAttributes.preview) {
   MainWidgetLiveActivity()
} contentStates: {
    MainWidgetAttributes.ContentState.smiley
    MainWidgetAttributes.ContentState.starEyes
}
