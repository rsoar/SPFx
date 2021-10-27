import * as React from 'react';
import { useEffect } from 'react';
import { IDataClient } from '../../../Interface/IDataClient';

import styles from '../Modal.module.scss';

import { IPersonaProps } from 'office-ui-fabric-react';

interface IProps {
  client: IDataClient
  handleModal: (dataClient) => void;
  defineValueInput: (e: any) => void;
  addClient: () => void;
  updateClient: (dataClient) => void;
  action: number;
  picker: any;
  peopleSelected: IPersonaProps;
  pickerMethod: () => void;
}

export const Add = ({pickerMethod, peopleSelected, client, handleModal, defineValueInput, addClient, updateClient, action, picker}: IProps) => {
  
  return(
    <div className={styles.modalBackground}>
      <div className={styles.modalContent}>
        <button className={styles.closeModal} onClick={handleModal}>X</button>
        { action !== 0 ? <h1>Editar cliente</h1> : <h1>Adicionar novo cliente</h1> }
        <label>Nome do cliente:</label>
        {pickerMethod()}
        {/* <input className={styles.inpt} name="Title" type="text" placeholder="Digite o nome completo do cliente" value={client.Title} onChange={defineValueInput} /> */}
        <label>Motivo:</label>
        <input className={styles.inpt} name="Motivo" type="text" placeholder="Motivo do atendimento" value={client.Motivo} onChange={defineValueInput} />
        <label>Situação:</label>
        <select className={styles.inpt} name="situacao" id="statusClient" onChange={(e) => defineValueInput(e)}>
          <option value="">----</option>
          <option value="Pendente">Em aberto</option>
          <option value="Finalizado">Finalizado</option>
        </select>
        {action !== 0 ? <button className={styles.addButton} onClick={() => updateClient(client)}>ATUALIZAR</button> : <button className={styles.addButton} onClick={addClient}>ADICIONAR</button> }
      </div>
    </div>
  )
}