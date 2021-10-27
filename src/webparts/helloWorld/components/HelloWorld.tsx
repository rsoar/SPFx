import { IBasePickerSuggestionsProps } from 'office-ui-fabric-react';
import * as React from 'react';
import UserPicker from '../../../components/UserPicker';
import styles from './HelloWorld.module.scss';
import { IHelloWorldProps } from './IHelloWorldProps';

const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: 'Pessoas sugeridas',
    mostRecentlyUsedHeaderText: 'Pessoas sugeridas',
    noResultsFoundText: 'Nenhum resultado foi encontrado',
    loadingText: 'Carregando',
    suggestionsAvailableAlertText: 'Sugestões disponíveis do People Picker',
    suggestionsContainerAriaLabel: 'Pessoas sugeridas',
};

export default function HelloWorld(props: IHelloWorldProps){
    return (
        <div>
            ola
            <UserPicker
                key="b"
                // pickerSuggestionsProps={suggestionProps}
                onChange={async (users) => {
                    console.log(users);
                    // if (users.length > 0) {
                    //     setFormData({...formData, phaseDetailSponsors: users });
                    // } else {
                    //     setFormData({...formData, phaseDetailSponsors: null });
                    // }
                }}
                // inputProps={{
                //     placeholder: "Selecione os sponsors da fase..."
                // }}
            />
        </div>
    );
}
