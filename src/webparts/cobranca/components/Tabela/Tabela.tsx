import * as React from 'react';
import { IDataClient } from '../../Interface/IDataClient';

import { Icon } from 'office-ui-fabric-react';

import styles from './Tabela.module.scss';

interface IProps {
  unfilteredClients: IDataClient[];
  currentPage: number;
  pageSize: number;
  pages: number;
  loading: boolean;
  loadMore: (e: any) => void;
  editModal: (dataClient: IDataClient) => void;
  deleteModal: (dataClient: IDataClient) => void;
  formatDate: (date: string, count: number) => void;
}

const Tabela = ({unfilteredClients, currentPage, pageSize, pages, loading, editModal, deleteModal, formatDate, loadMore}: IProps): JSX.Element => {
  return (
    <>
      <table>
        <tr>
          <th>Cliente</th>
          <th>Data do registro</th>
          <th>Motivo do contato</th>
          <th>Situação</th>
          <th>Ação</th>
        </tr>
      {unfilteredClients !== null && (
        unfilteredClients.slice(currentPage * pageSize, currentPage * pageSize + pageSize).map(dataClient => (
          <tr>
            <td>
                <div className={styles.tdCtn}>
                  <img src={dataClient.ImageUrl} alt={dataClient.Title} />
                  {dataClient.Title}
              </div>
            </td>
            <td>
              <div className={styles.tdCtn2}>
                {formatDate(dataClient.Created, 10)}
                <span>Editado por último: {formatDate(dataClient.Modified, 16)}</span>
              </div>
            </td>
            <td>{dataClient.Motivo}</td>
            { dataClient.situacao == 'Finalizado' ? <td className={styles.statusFinish}>{dataClient.situacao}</td> : <td className={styles.statusPending}>{dataClient.situacao}</td> }
            <td>
              <div className={styles.tdCtn}>
                <button onClick={() => {deleteModal(dataClient)}}>
                  < Icon iconName="Delete" title="Excluir" aria-aria-label="Excluir" className={styles.iconDelete}/>
                </button>
                <button onClick={() => editModal(dataClient)}>
                  < Icon iconName="Edit" title="Editar" aria-label="Editar" className={styles.iconEdit} />
                </button>
              </div>
            </td>
          </tr>
        )))}
      </table>
      <div className={styles.paginationContainer}>
        { loading !== null && (
          Array.from(Array(pages), (item, index) => (
            <button
              className={styles.paginationButtons}
              value={index}
              onClick={(e: any) => loadMore(e)}
              >{index + 1}</button>
          ))) }
      </div>
    </>
  )
}

export default Tabela;