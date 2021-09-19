import { Divider, PageHeader, Button, Icon, Modal, Input, notification } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React, { Fragment, useState, useCallback, useRef } from 'react'
import { titles } from '../../setup/messages'
import PaginatedList from '../list/PaginatedList'
import { IPaginatedListAPI } from '../list/models/IPaginatedListAPI'
import { ITransfer } from './models/ITransfer'
import axios from 'axios'

const TransfersPage: React.FC = () => {
  const endpoint = `/api/transfers`
  const listRef = useRef<IPaginatedListAPI>(null)

  const [kudosId, setKudosId] = useState('')
  const [comment, setComment] = useState('')
  const [editModalVisibilty, setEditModalVisibilty] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const submitNewReason = useCallback(async () => {
    try {
      setConfirmLoading(true)
      await axios.patch<ITransfer>(`${endpoint}/${kudosId}`, {
        comment,
      })

      const { current } = listRef

      if (current) {
        current.refetchData()
      }

      handleEditCancel()
    } catch (err) {
      handleEditCancel()

      notification.error({
        message: 'Something went wrong',
      })
    }
  }, [endpoint, kudosId, comment])

  const handleEditCancel = () => {
    setConfirmLoading(false)
    setEditModalVisibilty(false)
    setKudosId('')
    setComment('')
  }

  const showEditKudosModal = useCallback((kudos: ITransfer) => {
    setKudosId(kudos._id)
    setComment(kudos.comment as string)
    setEditModalVisibilty(true)
  }, [setKudosId, setComment, setEditModalVisibilty])

  const deleteKudos = useCallback(async (id: string) => {
    try {
      await axios.delete(`${endpoint}/${id}`)

      const { current } = listRef

      if (current) {
        current.refetchData()
      }
    } catch (err) {
      notification.error({
        message: 'Something went wrong',
      })
    }
  }, [endpoint])

  const showDeleteKudosModal = useCallback(({ _id }: ITransfer) => {
    Modal.confirm({
      cancelText: 'No',
      content: 'You won\'t be able to revert the Kudos.',
      okText: 'Yes',
      okType: 'danger',
      onOk() {
        deleteKudos(_id)
      },
      title: `Are you sure to delete this Kudos`,
      maskClosable: false,
    })
  }, [deleteKudos])

  const renderListItemOptions = useCallback((isEditable: boolean, raw: ITransfer) => (
    isEditable &&
    <div>
      <Button onClick={() => showEditKudosModal(raw)}>
        <Icon type={'edit'} />
      </Button>
      <Divider type="vertical" />
      <Button onClick={() => showDeleteKudosModal(raw)}>
        <Icon type={'delete'} />
      </Button>
    </div>
  ), [showEditKudosModal, showDeleteKudosModal])

  const columns: Array<ColumnProps<ITransfer>> = [
    {
      dataIndex: 'date',
      key: 'date',
      render: text => moment(text).format('DD-MMM-YYYY'),
      title: 'Date',
    },
    {
      dataIndex: 'senderName',
      key: 'sender',
      title: 'Sender'
    },
    {
      dataIndex: 'receiverName',
      key: 'receiver',
      title: 'Receiver'
    },
    {
      dataIndex: 'value',
      key: 'value',
      title: 'Value'
    },
    {
      dataIndex: 'comment',
      key: 'comment',
      title: 'Message'
    },
    {
      dataIndex: 'isEditable',
      key: 'actions',
      title: 'Options',
      render: renderListItemOptions,
    },
  ];

  return (
    <Fragment>
      <PageHeader
        title={titles.transfers}
      />
      <Divider />
      <PaginatedList<ITransfer>
        columns={columns}
        endpoint={endpoint}
        pageSize={10}
        getAPIRef={listRef}
      />
      <Modal
        title='Edit Message'
        visible={editModalVisibilty}
        onOk={submitNewReason}
        confirmLoading={confirmLoading}
        onCancel={handleEditCancel}
        maskClosable={false}
      >
        <Input.TextArea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
      </Modal>
    </Fragment>
  )
}

export default TransfersPage
