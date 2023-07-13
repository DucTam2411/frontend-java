import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import styled from '@emotion/styled'
import { colors } from '~/lib/colors'
import { useUser } from '~/states/user'
import Button from '../system/Button'
import Input from '../system/Input'
import { changePassword, unregister } from '~/lib/api/me'
import { extractError } from '~/lib/error'
import { media } from '~/lib/media'
import { useOpenDialog } from '~/states/dialog'

function AccountSetting() {
  const user = useUser()
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
  })
  const openDialog = useOpenDialog()

  const reset = () => {
    setForm({
      oldPassword: '',
      newPassword: '',
    })
  }

  const { mutate: mutateChangePassword } = useMutation(changePassword, {
    onSuccess: () => {
      openDialog({
        title: '비밀번호 변경',
        description: '비밀번호가 변경되었습니다.',
      })
      reset()
    },
    onError: (e) => {
      const error = extractError(e)
      reset()
      if (error.name === 'BadRequest') {
        openDialog({
          title: '실패',
          description:
            '8자 이상, 영문/숫자/특수문자 중 2가지 이상 입력해주세요.',
        })
      } else if (error.name === 'Forbidden') {
        openDialog({
          title: '실패',
          description: '잘못된 비밀번호입니다.',
        })
      }
    },
  })

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const key = e.target.name
    const { value } = e.target
    setForm({ ...form, [key]: value })
  }

  const [isEditAuthor, setIsEditAuthor] = useState(false)
  const [authorName, setAuthorName] = useState(user.author.name)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    mutateChangePassword(form)
  }

  const onSubmitAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    // alert('go')
    const res = await fetch(
      `http://localhost:8080/authors/5ea35caa-2565-4781-a01a-e9292eeaaf2f`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: authorName,
        }),
      },
    ).then(() => {
      user.setAuthor(authorName)
      setIsEditAuthor(false)
    })
  }

  const askUnregister = () => {
    openDialog({
      title: 'Confirm',
      description: 'Do you really want to delete account??',
      mode: 'YESNO',
      cancelText: 'NO',
      confirmText: 'YES',
      async onConfirm() {
        try {
          await unregister()
        } catch (e) {}
        window.location.href = '/'
      },
    })
  }

  if (!user) return null

  return (
    <Block>
      <div>
        <Title>My account</Title>
        <Section>
          <h4>Username</h4>
          <Username>{user.username}</Username>
        </Section>
        <Section>
          <h4>Password</h4>
          <form onSubmit={onSubmit}>
            <InputGroup>
              <Input
                name="oldPassword"
                placeholder="Old password"
                type="password"
                onChange={onChange}
                value={form.oldPassword}
              />
              <Input
                name="newPassword"
                placeholder="New password"
                type="password"
                onChange={onChange}
                value={form.newPassword}
              />
            </InputGroup>
            <Button variant="secondary" type="submit">
              Change your password
            </Button>
          </form>
        </Section>

        <Section>
          <h4>Author</h4>
          <form onSubmit={onSubmitAuthor}>
            <InputGroup>
              <div style={{ display: 'flex' }}>
                <Username>{user.author.name}</Username>
                <button
                  style={{
                    display: 'inline',
                    marginLeft: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.preventDefault()

                    setIsEditAuthor(!isEditAuthor)
                  }}
                >
                  🖊️
                </button>
              </div>
              {isEditAuthor && (
                <Input
                  name="newAuthor"
                  placeholder="New name"
                  type="text"
                  onChange={(e) => setAuthorName(e.target.value)}
                  value={authorName}
                />
              )}
            </InputGroup>

            {isEditAuthor && (
              <Button variant="secondary" type="submit">
                Change your author
              </Button>
            )}
          </form>
        </Section>
      </div>
      <UnregisterWrapper>
        <UnregisterButton onClick={askUnregister}>
          Delete account
        </UnregisterButton>
      </UnregisterWrapper>
    </Block>
  )
}

const Title = styled.h1`
  margin-top: 0;
  margin-bottom: 32px;
  font-weight: 800;
  color: ${colors.gray5};
  font-size: 48px;
  line-height: 1.5;
`

const Block = styled.div`
  padding: 16px;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;

  ${media.mobile} {
    width: 100%;
    max-width: 768px;
    margin-left: auto;
    margin-right: auto;
    flex: initial;
    margin-top: 96px;
  }
`

const Section = styled.section`
  h4 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 16px;
    color: ${colors.gray3};
  }

  & + & {
    margin-top: 32px;
  }
`
const Username = styled.div`
  font-size: 16px;
  color: ${colors.gray5};
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  ${media.mobile} {
    width: 460px;
  }
`

const UnregisterButton = styled.button`
  font-size: 16px;
  color: #f53e3e;
  text-decoration: underline;
  cursor: pointer;
`

const UnregisterWrapper = styled.div`
  ${media.mobile} {
    margin-top: 96px;
  }
`

export default AccountSetting
