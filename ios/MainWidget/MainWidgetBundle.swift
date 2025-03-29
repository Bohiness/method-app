//
//  MainWidgetBundle.swift
//  MainWidget
//
//  Created by Artem Afonin on 29.03.2025.
//

import WidgetKit
import SwiftUI

@main
struct MainWidgetBundle: WidgetBundle {
    var body: some Widget {
        MainWidget()
        MainWidgetControl()
        MainWidgetLiveActivity()
    }
}
