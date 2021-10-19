import * as React from 'react';
import * as ReactDom from 'react-dom';

import Cobranca from './components/Cobranca/Cobranca';

import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import * as strings from 'CobrancaWebPartStrings';
import { sp } from '@pnp/sp';

export interface ICobrancaWebPartProps {
  description: string;
}

export default class CobrancaWebPart extends BaseClientSideWebPart<ICobrancaWebPartProps> {

  protected onInit(): Promise<void> {

    return super.onInit().then(_ => {
      sp.setup({
        spfxContext: this.context
      });
    });
  }
  
  public render(): void {
    const element: React.ReactElement = React.createElement(
      Cobranca,
    );
    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
