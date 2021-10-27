import { sp } from '@pnp/sp';
import "@pnp/sp/search";
import * as React from 'react';
import { IPersonaProps, NormalPeoplePicker } from 'office-ui-fabric-react';

export default function UserPicker(props) {
    
    const onResolveSuggestions = async (
        filterText: string,
        currentPersonas: IPersonaProps[]
    ) => {
        const personas = await sp.searchWithCaching({
            Querytext: `Title: "${filterText}*" OR WorkEmail: "${filterText}*"`,
            SourceId: "b09a7990-05ea-4af9-81ef-edfab16c4e31",
            RowLimit: 100,
        });

        const currentEmails = currentPersonas.map(x => x.secondaryText);

        let parsedPersonas = personas.PrimarySearchResults.map((persona:any) => {
            return {
                id: persona.ID,
                accountName: persona.AccountName,
                workEmail: persona.WorkEmail,
                secondaryText: persona.WorkEmail,
                text: persona.PreferredName,
                imageUrl: `/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${persona.WorkEmail}`,
                showInitialsUntilImageLoads: true
            } as IPersonaProps;
        }).filter(x => !currentEmails.includes(x.secondaryText));
        
        return parsedPersonas;
    };

    return <NormalPeoplePicker onResolveSuggestions={onResolveSuggestions} {...props}/>;
}