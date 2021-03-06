import * as React from 'react';
import { Page, View, Text } from 'react-figma';

export const App = () => {
    return (
        <Page name="New page" isCurrent>
            <View
                layoutMode="VERTICAL"
                horizontalPadding={20}
                verticalPadding={20}
                itemSpacing={10}
                style={{
                    backgroundColor: '#ffffff',
                    width: 200
                }}>
                <View
                    style={{ height: 40, backgroundColor: '#ffaa97' }}
                    layoutMode="HORIZONTAL"
                    layoutAlign="STRETCH"
                />
                <View
                    style={{ height: 40, backgroundColor: '#ffaa97' }}
                    layoutMode="HORIZONTAL"
                    layoutAlign="STRETCH"
                />
                <View
                    style={{ width: 80, height: 40, backgroundColor: '#ffaa97' }}
                    layoutMode="HORIZONTAL"
                    layoutAlign="MAX"
                />
            </View>
        </Page>
    );
};
