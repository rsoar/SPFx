import * as React from 'react';
import { IDataClient } from '../../../Interface/IDataClient';

import styles from "./AddModal.module.scss";

interface IDataList {
  dataClient: IDataClient;
  handleAddModal: (e:any ) => void;
  addClient: () => void;
  getDataForm: (e: any) => void;
}

export const AddModal = ({dataClient, handleAddModal, addClient, getDataForm}: IDataList) => {
  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalContent}>
        <button onClick={handleAddModal}>X</button>
        <h1>Adicionar novo cliente</h1>
        <label>Nome Completo do cliente</label>
        <input id="nameClient" type="text" placeholder="Digite o nome completo do cliente"  onChange={getDataForm} value={dataClient.Title}/>
        <label htmlFor="">Motivo:</label>
        <input id="description" type="text" placeholder="Motivo do atendimento"  onChange={getDataForm}/>
        <select name="statusClient" id="statusClient">
          <option id="pending" value="aberto">Em aberto</option>
          <option id="finalized" value="respondido">Respondido</option>
        </select>
        <button onClick={addClient}>Adicionar</button>
      </div>
    </div>
  )
}
