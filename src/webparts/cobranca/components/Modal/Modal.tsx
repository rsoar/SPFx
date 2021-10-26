import { PagedItemCollection } from '@pnp/sp/items';
import * as React from 'react';
import { useEffect } from 'react';
import { IDataClient } from '../../Interface/IDataClient';

import styles from './Modal.module.scss';

interface IProps { 
  listDataClient: IDataClient[];
  dateFormatMethod: (date: string) => string;
  deleteClientMethod: (id: number) => void;
  editClientMethod: (e: any, item: IDataClient) => void;
  handleModal: () => void; 
  pageSize: number;
  currentPage: number;
  pages: number;
  loadMoreMethod: (e: any) => void;
}

export const Modal = ({listDataClient, dateFormatMethod, deleteClientMethod, handleModal, editClientMethod, pages, pageSize, currentPage, loadMoreMethod}: IProps) => {

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalContent}>
        <button className={styles.closeModal} onClick={handleModal}>X</button>
        <table>
          <tr>
            <th>Nome do cliente</th>
            <th>Data</th>
            <th>Motivo</th>
            <th>Situação</th>
            <th>Ação</th>
          </tr>
          { listDataClient.slice(currentPage * pageSize, currentPage + pageSize).map(item => (
            <tr>
              <td>{item.Title}</td>
              <td>{dateFormatMethod(item.Created)}</td>
              <td>{item.Motivo}</td>
              { item.situacao == 'Pendente' ? <td className={styles.statusPending}>{item.situacao}</td> : <td className={styles.statusFinish}>{item.situacao}</td> }
              <select name="editStatusClient" id="editStatusClient" onChange={(e) => editClientMethod(e, item)}>
                <option value={`${item.situacao}`}>----</option>
                <option value="Pendente">Pendente</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </tr>
              )) }
            <div className={styles.paginationContainer}>
              {Array.from(Array(pages), (item, index) => (
                <div>
                  <button className={styles.paginationButtons} value={index} onClick={(e) => loadMoreMethod(e)}>{index + 1}</button>
                </div>
              ))}
            </div>
        </table>
      </div>
    </div>
  )
}