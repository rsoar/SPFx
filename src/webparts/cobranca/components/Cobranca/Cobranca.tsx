import * as React from 'react';
import { useState, useEffect } from 'react';
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
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);

  const [action, setAction] = useState<string>(null);
  const [filter, setFilter] = useState<string>('Nome');
  
  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>([]);
  const [unfilteredClients, setUnfilteredClients] = useState<IDataClient[]>([]);
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: '',
  });


  /* states paginacao */
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(6);
  const pages = Math.ceil(unfilteredClients.length/pageSize);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    loadData();
    const campoBusca: HTMLInputElement = document.getElementById('searchInput') as HTMLInputElement;
    campoBusca.value = ''
  }, [filter]);

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
    setAction('delete');
    await sp.web.lists.getByTitle("Cobranças").items.getById(id).delete();
    loadData();
  }

  const editClient = async (e: any, item: IDataClient) => {
    await sp.web.lists.getByTitle("Cobranças").items.getById(item.Id).update({
      situacao: e.target.value
    });
    loadData();
  }
  
  const clientRender = () => (
    unfilteredClients !== null ? unfilteredClients.slice(currentPage * pageSize, currentPage * pageSize + pageSize).map(dataClient => (
      <tr>
        <td>{dataClient.Title}</td>
        <td>{dateFormat(dataClient.Created)}</td>
        <td>{dataClient.Motivo}</td>
        { dataClient.situacao == 'Finalizado' ? <td className={styles.statusFinish}>{dataClient.situacao}</td> : <td className={styles.statusPending}>{dataClient.situacao}</td> }
      </tr>
    )) : [] 
  );

  const loading = unfilteredClients === null;

  const dateFormat = (date: string) => {
    let data = new Date(date);
    let dateFormated = ((data.getDate() )) + "-" + ((data.getMonth() + 1)) + "-" + data.getFullYear(); 
    return dateFormated;
  }
  
  const defineValueInput = (e: React.ChangeEvent<HTMLInputElement>) => setClient({ ...client, [e.target.name]: e.target.value });

  const handleModal = () => setShowAddModal(!showAddModal);

  const handleDeleteModal = () => {
    setAction('delete');
    setDeleteModal(!deleteModal);
  }

  const handleEditModal = () => {
    setAction('edit');
    setEditModal(!editModal);
  }

  const filterClient = async (e) => {
    if(e.target.id == 'filter') setFilter(e.target.value);

    switch (filter) {
      case 'Nome':
        setUnfilteredClients(listDataClient.filter(data => data.Title.toLowerCase().includes(e.target.value.toLowerCase())));
        break
      case 'Motivo': 
        setUnfilteredClients(listDataClient.filter(data => data.Motivo.toLowerCase().includes(e.target.value.toLowerCase())))
        break
      case 'Data': 
        setUnfilteredClients(listDataClient.filter(data => data.Created.toLowerCase().includes(e.target.value.toLowerCase())))
        break
    }
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
          <a href="#" onClick={handleDeleteModal}>Excluir</a>
        </div>
        <section className={styles.dataBox}>
        </section>
        <div className={styles.infoHeader}>
          <h2>Lista de clientes</h2>
          <div>
            <input id="searchInput" className={styles.inputSearchClient} type="text" placeholder="Busca..." onChange={filterClient} />
            <label>Procurar por:</label>
            <select name="filter" id="filter" onChange={filterClient}>
              <option id="name">Nome</option>
              <option id="date">Data</option>
              <option id="description">Motivo</option>
            </select>
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
              </tr>
            {clientRender()}
            </table>
            <div className={styles.paginationContainer}>
              { Array.from(Array(pages), (item, index) => (
                <div>
                  <button className={styles.paginationButtons} value={index} onClick={(e) => loadMore(e)}>{index}</button>
                </div>
              )) }
            </div>
          </>
        }
        {/* Modal add */}
        { showAddModal ? < Add client={client} handleModal={handleModal} defineValueInput={defineValueInput} addClient={addCliente} /> : showAddModal }
        {/* Modal delete */}
        { deleteModal ? < Modal pages={pages} pageSize={pageSize} currentPage={currentPage} loadMoreMethod={loadMore} listDataClient={listDataClient} dateFormatMethod={dateFormat} deleteClientMethod={deleteClient} handleModal={handleDeleteModal}  action={action} editClientMethod={editClient}/> : deleteModal }
        {/* Modal edit */}
        { editModal ? < Modal pages={pages} pageSize={pageSize} currentPage={currentPage} loadMoreMethod={loadMore} listDataClient={listDataClient} dateFormatMethod={dateFormat} deleteClientMethod={deleteClient} handleModal={handleEditModal} action={action} editClientMethod={editClient}/> : editModal }
      </main>
    </div>
  )
}

export default Cobranca;