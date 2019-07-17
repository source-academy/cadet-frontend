import { Card, Icon, IconName, Tab, TabId, Tabs, Tooltip } from '@blueprintjs/core';
import * as React from 'react';

/**
 * @property animate Set this to false to disable the movement
 * of the selected tab indicator.
 *
 * @property defaultSelectedTabId The id of a SideContentTab to be
 *  selected initially when the SideContent component is mounted.
 *
 * @property onChange A function that is called whenever the
 * active tab is changed by the user.
 *
 * @property tabs An array of SideContentTabs.
 *  The tabs will be rendered in order of the array.
 *  If this array is empty, no tabs will be rendered.
 *
 * @property renderActiveTabPanelOnly Set this property to
 * true to enable unmounting of tab panels whenever tabs are
 * switched. If it is left undefined, the tab panels will all
 * be loaded with the mounting of the SideContent component,
 * and switching tabs will merely hide them from view.
 */
export type SideContentProps = {
  animate?: false;
  defaultSelectedTabId?: TabId;
  onChange?: (newTabId: TabId, prevTabId: TabId, event: React.MouseEvent<HTMLElement>) => void;
  renderActiveTabPanelOnly?: true;
  tabs: SideContentTab[];
};

/**
 * @property label A string that will appear as the tooltip.
 *
 * @property iconName BlueprintJS IconName element, used to render the
 *   icon which will be displayed over the SideContent panel.
 *
 * @property body The element to be rendered in the SideContent panel
 *  when the tab is selected.
 *
 * @property id A string/number that will be used as the tab ID and key.
 *  If id is undefined, id will be set to label by the renderTab function.
 *
 * @property disabled Set this property to true to disable a tab. The
 * corresponding tab label will still be rendered on hover, but the
 * tab will be greyed out and cannot be selected.
 */
export type SideContentTab = {
  label: string;
  iconName: IconName;
  body: JSX.Element;
  id?: TabId;
  disabled?: true;
};

class SideContent extends React.PureComponent<SideContentProps, {}> {
  public render() {
    const tabs = this.props.tabs.map(this.renderTab);

    const changeTabsCallback = (
      newTabId: TabId,
      prevTabId: TabId,
      event: React.MouseEvent<HTMLElement>
    ): void => {
      if (this.props.onChange === undefined) {
        this.resetAlert(prevTabId);
      } else {
        this.props.onChange(newTabId, prevTabId, event);
        this.resetAlert(prevTabId);
      }
    };

    return (
      <div className="side-content">
        <Card>
          <div className="side-content-tabs">
            <Tabs
              id="side-content-tabs"
              onChange={changeTabsCallback}
              defaultSelectedTabId={this.props.defaultSelectedTabId}
              renderActiveTabPanelOnly={this.props.renderActiveTabPanelOnly}
            >
              {tabs}
            </Tabs>
          </div>
        </Card>
      </div>
    );
  }

  private renderTab = (tab: SideContentTab) => {
    // This variable will be the height and width of the BlueprintJS
    // icon (in pixels) when rendered by a web browser.
    const size = 25;

    const tabId = tab.id === undefined ? tab.label : tab.id;
    const tabTitle: JSX.Element = (
      <Tooltip content={tab.label}>
        <div className="side-content-tooltip" id={this.generateIconId(tabId)}>
          <Icon icon={tab.iconName} iconSize={size} />
        </div>
      </Tooltip>
    );
    const tabPanel: JSX.Element = <div className="side-content-text">{tab.body}</div>;

    return (
      <Tab
        key={tabId}
        id={tabId}
        title={tabTitle}
        panel={tabPanel}
        disabled={tab.disabled}
        className="side-content-tab"
      />
    );
  };

  // Function to generate an icon id given a TabId, used to set and remove the
  // "side-content-tab-alert" style to the tabs.
  private generateIconId(tabId: TabId) {
    return `${tabId}-icon`;
  }

  // Function to remove the "side-content-tab-alert" class that makes the
  // tabs flash. This function is to be run when the tabs are changed.
  //
  // Currently this style is only used for the "Inspector" and "Env Visualizer" tabs.
  private resetAlert = (prevTabId: TabId) => {
    const iconId = this.generateIconId(prevTabId);
    const icon = document.getElementById(iconId);

    // Remove alert from previous tab (the new selected tab will still have
    // the "side-content-tab-alert" class, but the CSS makes it invisible)
    if (icon) {
      icon.classList.remove('side-content-tab-alert');
    }
  };
}

export default SideContent;
