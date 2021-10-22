import { PagedItemCollection } from '@pnp/sp/items';
import * as React from 'react';
import { IDataClient } from '../../Interface/IDataClient';

import styles from './Modal.module.scss';

interface IProps { 
  listDataClient: IDataClient[];
  dateFormatMethod: (date: string) => string;
  deleteClientMethod: (id: number) => void;
  editClientMethod: (e: any, item: IDataClient) => void;
  handleModal: () => void; 
  currentPage: PagedItemCollection<IDataClient[]>;
  prevPage: () => void;
  loadMore: () => void;
  action: string;
}

export const Modal = ({listDataClient, dateFormatMethod, deleteClientMethod, handleModal, currentPage, prevPage, loadMore, action, editClientMethod}: IProps) => {
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
          { listDataClient.map(item => (
            <tr>
              <td>{item.Title}</td>
              <td>{dateFormatMethod(item.Created)}</td>
              <td>{item.Motivo}</td>
              { item.situacao == 'Pendente' ? <td className={styles.statusPending}>{item.situacao}</td> : <td className={styles.statusFinish}>{item.situacao}</td> }
              { action !== null && action == 'delete' ? <button className={styles.deleteInfo} onClick={() => deleteClientMethod(item.Id)}>X</button> : <select name="editStatusClient" id="editStatusClient" onChange={(e) => editClientMethod(e, item)}>
                <option value="null">----</option>
                <option value="Pendente">Pendente</option>
                <option value="Finalizado">Finalizado</option>
              </select> }
            </tr>
              )) }
              { currentPage !== null && currentPage.hasNext ? <div className={styles.paginationBtn}>
              <button onClick={prevPage}>Voltar</button>
              <button onClick={loadMore}>Avançar</button>
            </div> : <div className={styles.paginationBtn}>
              <button onClick={prevPage}>Voltar</button>
              <button onClick={loadMore} disabled>Avançar</button>
            </div> }
        </table>
      </div>
    </div>
  )
}