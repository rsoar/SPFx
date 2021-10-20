import * as React from 'react';
import * as ReactDom from 'react-dom';

import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneTextField}  from '@microsoft/sp-property-pane';

import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import { setup as pnpSetup } from "@pnp/common";
import { sp } from '@pnp/sp';
import * as strings from 'CobrancaWebPartStrings';

import Cobranca from './components/Cobranca/Cobranca';
import { ICobrancaProps } from './components/Cobranca/ICobrancaProps';


export interface ICobrancaWebPartProps {
  description: string;
  context: WebPartContext;
}

export default class CobrancaWebPart extends BaseClientSideWebPart<ICobrancaWebPartProps> {

  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {
      pnpSetup({
        spfxContext: this.context
      });
    });
  }
  
  public render(): void {
    const element: React.ReactElement<ICobrancaProps> = React.createElement(
      Cobranca,
      {
        description: this.properties.description,
        context: this.context
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
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
