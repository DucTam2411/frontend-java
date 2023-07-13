import { type ActionFunction, redirect, json } from '@remix-run/node'
import { useFetcher, useNavigate } from '@remix-run/react'
import React, { useCallback, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import BasicLayout from '~/components/layouts/BasicLayout'
import LabelGroup from '~/components/system/LabelGroup'
import LabelInput from '~/components/system/LabelInput'
import LabelTextArea from '~/components/system/LabelTextArea'
import Editor from '~/components/write/Editor'
import WriteFormTemplate from '~/components/write/WriteFormTemplate'
import { createItem } from '~/lib/api/items'
import { applyAuth } from '~/lib/applyAuth'
import { extractError, useNextAppErrorCatch } from '~/lib/error'
import { media } from '~/lib/media'
import { useWriteActions, useWriteValue } from '~/states/write'
import axios from 'axios'

export const action: ActionFunction = async ({ request }) => {
  const applied = await applyAuth(request)
  // if (!applied) {
  //   throw new Error('Not logged in')
  // }
  const form = await request.formData()
  const link = form.get('link') as string
  const title = form.get('title') as string
  const body = form.get('body') as string

  try {
    var data = JSON.stringify({
      url: link,
      device: 'desktop',
      proxyCountry: 'us',
      fullPage: false,
    })

    var config = {
      method: 'post',
      url: 'https://api.geekflare.com/screenshot',
      headers: {
        'x-api-key': '44c59e88-1570-48e8-9761-b4a6354e29ff',
        'Content-Type': 'application/json',
      },
      data: data,
    }

    let thumbnail = ''
    await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data))
        thumbnail = response.data.data
      })
      .catch(function (error) {
        console.log(error)
      })

    const item = await createItem({
      link,
      title,
      body,
      thumbnail: thumbnail ?? 'https://picsum.photos/2000/1000',
    })
    return redirect(`/items/${item.id}`)
  } catch (e) {
    const error = extractError(e)
    throw json(error, {
      status: error.statusCode,
    })
  }
}

function Intro() {
  const { form } = useWriteValue()
  const actions = useWriteActions()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetcher = useFetcher()

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const key = e.target.name as 'title' | 'body'
    const { value } = e.target
    actions.change(key, value)
  }

  const onChangeBody = useCallback(
    (text: string) => {
      actions.change('body', text)
    },
    [actions],
  )

  return (
    <BasicLayout title="뉴스 소개" hasBackButton>
      <WriteFormTemplate
        description="Introduce the news you want to share."
        buttonText="Submit"
        onSubmit={async (e) => {
          e.preventDefault()
          if (form.title === '') {
            setErrorMessage('Error happen.')
            return
          }
          const result = fetcher.submit(form, {
            method: 'post',
          })
        }}
        isLoading={fetcher.state === 'submitting'}
      >
        <Group>
          <LabelInput
            label="Title"
            name="title"
            onChange={onChange}
            value={form.title}
          />
          <LabelEditorGroup label="Article">
            {({ onFocus, onBlur }) => (
              <StyledEditor
                onFocus={onFocus}
                onBlur={onBlur}
                onChangeText={onChangeBody}
              />
            )}
          </LabelEditorGroup>

          {errorMessage ? <Message>{errorMessage}</Message> : null}
        </Group>
      </WriteFormTemplate>
    </BasicLayout>
  )
}

export function CatchBoundary() {
  const caught = useNextAppErrorCatch()
  const actions = useWriteActions()
  const navigate = useNavigate()
  useEffect(() => {
    if (caught.status === 422) {
      navigate(-1)
      actions.setError(caught.data)
    }
  }, [caught, navigate, actions])
  return <Intro />
}

const Group = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  padding-bottom: 16px;
`

const LabelEditorGroup = styled(LabelGroup)`
  flex: 1;
  ${media.tablet} {
    flex: initial;
  }
`

const StyledLabelTextArea = styled(LabelTextArea)`
  flex: 1;
  textarea {
    flex: 1;
    resize: none;
    font-family: inherit;
  }
`

const Message = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: red;
  text-align: center;
`

const StyledEditor = styled(Editor)`
  flex: 1;
  display: flex;
  flex-direction: column;

  ${media.desktop} {
    flex: initial;
  }
`

export default Intro
