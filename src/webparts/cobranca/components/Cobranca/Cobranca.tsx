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

  const [prevClients, setPrevClients] = useState<IDataClient[]>(null);
  const [previousPage, setPreviousPage] = useState<PagedItemCollection<IDataClient[]>>(null)
  const [currentPage, setCurrentPage] = useState<PagedItemCollection<IDataClient[]>>(null);
  
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);

  const [action, setAction] = useState<string>(null);
  const [filter, setFilter] = useState<string>('Nome');
  
  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>(null);
  const [unfilteredClients, setUnfilteredClients] = useState<IDataClient[]>(null);
  const [search, setSearch] = useState<string>();
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    loadData();
    setSearch('');
  }, [filter]);

  const loadData = async () => {
    const userAdmin = props.context.pageContext.user;
    const page: PagedItemCollection<IDataClient[]> = await sp.web.lists.getByTitle('Cobranças').items.top(6).getPaged();
    
    setAdminData(userAdmin);
    setListDataClient(page.results);
    setUnfilteredClients(page.results);
    setCurrentPage(page);
  }
  
  const loadMore = async () => {
    const nextPage = await currentPage.getNext()
    
    /* seta a pagina anterior como pagina atual */
    setPreviousPage(currentPage);
    setPrevClients(currentPage.results);

    /* seta a pagina atual como pagina seguinte */
    setCurrentPage(nextPage);
    setListDataClient(nextPage.results);
    setUnfilteredClients(nextPage.results);
  }
  
  const prevPage = async () => {
    setCurrentPage(previousPage); 
    setListDataClient(prevClients);
    setUnfilteredClients(prevClients);
  }

  const addCliente = async () => {
    if (client.Title == '' || client.Motivo == '' || client.situacao == '' ) return alert('Insira os dados do cliente');
    const newClient: IItemAddResult = await sp.web.lists.getByTitle("Cobranças").items.add({
      Title: client.Title,
      Motivo: client.Motivo,
      situacao: client.situacao
    });
    loadData();
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
    unfilteredClients !== null ? unfilteredClients.map(dataClient => (
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
  
  const defineValueInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.id == 'nameClient') setClient({...client, Title: e.target.value});
    if(e.target.id == 'description') setClient({...client, Motivo: e.target.value});
    if(e.target.id == 'statusClient') setClient({...client, situacao: e.target.value});
  }

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
    const el = e.target;
    setSearch(el.value);
    if(el.id == 'filter') setFilter(el.value);
    if(filter == 'Nome') {
      const filtered = listDataClient.filter(data => data.Title.toLowerCase().includes(el.value.toLowerCase()));
      setUnfilteredClients(filtered);
    } else if(filter == 'Motivo') {
      const filtered = listDataClient.filter(data => data.Motivo.toLowerCase().includes(el.value.toLowerCase()));
      setUnfilteredClients(filtered);
    } else if (filter == 'Data') {
      const filtered = listDataClient.filter(data => data.Created.includes(el.value));
      setUnfilteredClients(filtered);
    }
  }

  const renderPagination = () => (
    currentPage !== null && currentPage.hasNext ?
        <div className={styles.paginationBtn}>
          { previousPage == null ? <button onClick={prevPage} disabled>Voltar</button> : <button onClick={prevPage}>Voltar</button>}
          <button onClick={loadMore}>Avançar</button>
        </div>
      : <div className={styles.paginationBtn}>
          <button onClick={prevPage}>Voltar</button>
          <button onClick={loadMore} disabled>Avançar</button>
        </div> 
  )

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
            <input id="searchInput" className={styles.inputSearchClient} type="text" placeholder="Busca..." onChange={filterClient} value={search} />
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
          { !search && renderPagination()}
          </>
        }
        {/* Modal add */}
        { showAddModal ? < Add client={client} handleModal={handleModal} defineValueInput={defineValueInput} addClient={addCliente} /> : showAddModal }
        {/* Modal delete */}
        { deleteModal ? < Modal listDataClient={listDataClient} dateFormatMethod={dateFormat} deleteClientMethod={deleteClient} handleModal={handleDeleteModal}  currentPage={currentPage} prevPage={prevPage} loadMore={loadMore} action={action} editClientMethod={editClient}/> : deleteModal }
        {/* Modal edit */}
        { editModal ? < Modal listDataClient={listDataClient} dateFormatMethod={dateFormat} deleteClientMethod={deleteClient} handleModal={handleEditModal} currentPage={currentPage} prevPage={prevPage} loadMore={loadMore} action={action} editClientMethod={editClient}/> : editModal }
      </main>
    </div>
  )
}

export default Cobranca;