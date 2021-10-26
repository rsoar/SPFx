import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './Cobranca.module.scss';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";

import { IItemAddResult, PagedItemCollection } from "@pnp/sp/items";
import { IDataClient } from '../../Interface/IDataClient';

import { PropertyPaneSlider } from '@microsoft/sp-property-pane';
import { ICobrancaProps } from './ICobrancaProps';
import { IDataAdmin } from '../../Interface/IDataAdmin';
import { IList } from '@pnp/sp/lists';

import * as _ from 'lodash';
import { filter } from 'lodash';
import { Modal } from '../Modal/Modal';
import { Add } from '../Modal/Add/Add';


function Cobranca (props: ICobrancaProps) {

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [idClient, setIdClient] = useState<number>(null);

  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>([]);
  const [unfilteredClients, setUnfilteredClients] = useState<IDataClient[]>([]);
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: '',
  });
  const filterInput = useRef(null);
  /* states paginacao */
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(6);
  const pages = Math.ceil(unfilteredClients.length/pageSize);

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const userAdmin = props.context.pageContext.user;
    const allItems: IDataClient[] = await sp.web.lists.getByTitle("Cobranças").items.get();
    
    setAdminData(userAdmin);
    setListDataClient(allItems);
    setUnfilteredClients(allItems);
  }

  const loadMore = (e: any) => setCurrentPage(e.target.value);

  const addCliente = async () => {
    if (client.Title == '' || client.Motivo == '' || client.situacao == '' ) return alert('Insira os dados do cliente');
    const newClient: IItemAddResult = await sp.web.lists.getByTitle("Cobranças").items.add({
      Title: client.Title,
      Motivo: client.Motivo,
      situacao: client.situacao
    });
    loadData();
    setClient({...client, Title: '', Motivo: ''})
  }

  const deleteClient = async (id: number) => {
    await sp.web.lists.getByTitle("Cobranças").items.getById(id).delete();
    loadData();
  }

  const editClient = async (e: any, item: IDataClient) => {
    await sp.web.lists.getByTitle("Cobranças").items.getById(item.Id).update({
      situacao: e.target.value
    });
    loadData();
  }
  
  const loading = unfilteredClients === null;

  const dateFormat = (date: string) => {
    let data = new Date(date);
    let dateFormated = ((data.getDate() )) + "-" + ((data.getMonth() + 1)) + "-" + data.getFullYear(); 
    return dateFormated;
  }
  
  const defineValueInput = (e: React.ChangeEvent<HTMLInputElement>) => setClient({ ...client, [e.target.name]: e.target.value });

  const handleModal = () => setShowAddModal(!showAddModal);

  const handleshowDeleteModal = (clientID: number) => {
    setShowDeleteModal(!showDeleteModal);
    setIdClient(clientID);
  }

  const handleEditModal = () => {
    setEditModal(!editModal);
  }

  const handleFilterClients = (e) => {
    const filtered = listDataClient.filter(item => (
      item.Title.toLowerCase().includes(e.target.value) || item.Motivo.toLowerCase().includes(e.target.value) || item.situacao.toLowerCase().includes(e.target.value)
    ))
    setUnfilteredClients(filtered);
  }

  return (
    <div className={styles.bgContainer}>
      <header>
        <h3>Painel do administrador</h3>
        <div>
          { adminData ? <img className={styles.iconAdmin} src={`/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${adminData.email}`} alt="admin-icon" /> : <img className={styles.iconAdmin} src="https://e7.pngegg.com/pngimages/636/819/png-clipart-computer-icons-privacy-policy-admin-icon-copyright-rim.png" alt="" /> }
          <span>Administrador</span>
        </div>
      </header>
      <main>
        <div className={styles.category}>
          <a href="#" onClick={handleModal}>Adicionar</a>
          <a href="#" onClick={handleEditModal}>Editar</a>
        </div>
        <section className={styles.dataBox}>
          <p>Número de clientes cadastrados: <span className={styles.countBox}>{listDataClient.length}</span></p>
          <p>Clientes com situação <span className={styles.statusPending}>pendente</span>: <span className={styles.countBox}>{listDataClient.filter(data => data.situacao === 'Pendente').length}</span></p>
          <p>Clientes com situação <span className={styles.statusFinish}>finalizado</span>: <span className={styles.countBox}>{listDataClient.filter(data => data.situacao === 'Finalizado').length}</span></p>
        </section>
        <div className={styles.infoHeader}>
          <h2>Lista de clientes</h2>
          <div>
            <input ref={filterInput} id="searchInput" className={styles.inputSearchClient} type="text" placeholder="Busca..." onChange={handleFilterClients} />
          </div>
        </div>
          {loading ? <div className={styles.loadbox}><div className={styles.loading}></div></div> : 
          <>
            <table>
              <tr>
                <th>Nome do cliente</th>
                <th>Data do registro</th>
                <th>Motivo do contato</th>
                <th>Situação</th>
                <th>Ação</th>
              </tr>
            {unfilteredClients !== null && (
              unfilteredClients.slice(currentPage * pageSize, currentPage * pageSize + pageSize).map(dataClient => (
                <tr>
                  <td>{dataClient.Title}</td>
                  <td>{dateFormat(dataClient.Created)}</td>
                  <td>{dataClient.Motivo}</td>
                  { dataClient.situacao == 'Finalizado' ? <td className={styles.statusFinish}>{dataClient.situacao}</td> : <td className={styles.statusPending}>{dataClient.situacao}</td> }
                  <td><button className={styles.deleteInfo} onClick={() => handleshowDeleteModal(dataClient.Id)}>X</button></td>
                </tr>
              )))}
            </table>
            <div className={styles.paginationContainer}>
              { Array.from(Array(pages), (item, index) => (
                <div>
                  <button className={styles.paginationButtons} value={index} onClick={(e) => loadMore(e)}>{index + 1}</button>
                </div>
              )) }
            </div>
          </>
        }
        {/* Modal add */}
        { showAddModal ? < Add client={client} handleModal={handleModal} defineValueInput={defineValueInput} addClient={addCliente} /> : showAddModal }
        {/* Modal delete */}
        { showDeleteModal ? 
          <div className={styles.modalBackground}>
            <div className={styles.modalContent}>
              <h1>Tem certeza que deseja excluir?</h1>
              <div>
                <button onClick={() => setShowDeleteModal(!showDeleteModal)}>Não</button>
                <button onClick={() =>{
                  setShowDeleteModal(!showDeleteModal);
                  deleteClient(idClient);
                }}>Sim</button>
              </div>
            </div>
          </div>
           : !showDeleteModal }
        {/* Modal edit */}
        { editModal ? < Modal pages={pages} pageSize={pageSize} currentPage={currentPage} loadMoreMethod={loadMore} listDataClient={listDataClient} dateFormatMethod={dateFormat} deleteClientMethod={deleteClient} handleModal={handleEditModal} editClientMethod={editClient}/> : editModal }
      </main>
    </div>
  )
}

export default Cobranca;