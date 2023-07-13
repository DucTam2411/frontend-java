import { Link } from '@remix-run/react'
import styled from '@emotion/styled'
import TabLayout from '~/components/layouts/TabLayout'
import { useLogout } from '~/hooks/useLogout'
import { colors } from '~/lib/colors'
import { css } from '@emotion/react'

function SettingIndex() {
  // const logout = useLogout()
  const logout = () => {}

  return (
    <TabLayout>
      <Block>
        <ListWrapper>
          <ListItemLink to="/setting/account">My account</ListItemLink>
          <ListItem onClick={logout}>Logout</ListItem>
        </ListWrapper>
      </Block>
    </TabLayout>
  )
}

const Block = styled.div`
  background: ${colors.gray0};
  flex: 1;
`

const ListWrapper = styled.div`
  * + div {
    border-top: 1px solid ${colors.gray0};
  }
`

const listItemStyle = css`
  padding: 16px;
  color: ${colors.gray5};
  background: white;
  &:active {
    opacity: 0.7;
  }
`

const ListItem = styled.div`
  ${listItemStyle}
`

const ListItemLink = styled(Link)`
  ${listItemStyle}
  display: block;
  text-decoration: none;
`

export default SettingIndex
