import { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { UnsupportedChainIdError } from '@web3-react/core'
import { ThirdwebSDK } from '@3rdweb/sdk'
import { useWeb3 } from '@3rdweb/hooks'

const sdk = new ThirdwebSDK('rinkeby')
const bundleDropModule = sdk.getBundleDropModule(
  '0x47B36997D21a4c41191dBA0B71050C279c770c49',
)
const tokenModule = sdk.getTokenModule(
  '0xb59fe658170fA89736cC8414D1a354ca21054A4A',
)
const voteModule = sdk.getVoteModule(
  '0xA35C202dB1EF2068E109aa000348cd8f7c6D9EE6',
)

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3()
  const signer = provider ? provider.getSigner() : undefined
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([])
  const [memberAddresses, setMemberAddresses] = useState([])
  const [proposals, setProposals] = useState([])
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4)
  }

  const mintNft = async () => {
    setIsClaiming(true)
    bundleDropModule
      .claim('0', 1)
      .then(() => {
        setHasClaimedNFT(true)
        console.log(
          `🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`,
        )
      })
      .catch((e) => {
        console.error('failed to claim', e)
      })
      .finally(() => {
        setIsClaiming(false)
      })
  }

  useEffect(() => {
    console.log('👋 Address:', address)
  }, [])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    bundleDropModule
      .getAllClaimerAddresses('0')
      .then((addresses) => {
        console.log('🚀 Members addresses', addresses)
        setMemberAddresses(addresses)
      })
      .catch((err) => {
        console.error('failed to get member list', err)
      })
  }, [hasClaimedNFT])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }
    voteModule
      .getAll()
      .then((proposals) => {
        console.log('🚀 Proposals', proposals)
        setProposals(proposals)
      })
      .catch((e) => {
        console.error('failed to get proposals', e)
      })
  }, [hasClaimedNFT])

  useEffect(() => {
    if (!hasClaimedNFT || !proposals.length) {
      return
    }
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted)
        if (hasVoted) {
          console.log('🥵 User has already voted')
        } else {
          console.log('🙂 User has not voted yet')
        }
      })
      .catch((err) => {
        console.error('failed to check if wallet has voted', err)
      })
  }, [hasClaimedNFT, proposals, address])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log('👜 Amounts', amounts)
        setMemberTokenAmounts(amounts)
      })
      .catch((err) => {
        console.error('failed to get token amounts', err)
      })
  }, [hasClaimedNFT])

  useEffect(() => {
    sdk.setProviderOrSigner(signer)
  }, [signer])

  useEffect(() => {
    if (!address) return

    return bundleDropModule
      .balanceOf(address, '0')
      .then((balance) => {
        if (balance.gt(0)) {
          setHasClaimedNFT(true)
          console.log('🌟 this user has a membership NFT!')
        } else {
          setHasClaimedNFT(false)
          console.log("😭 this user doesn't have a membership NFT.")
        }
      })
      .catch((e) => {
        setHasClaimedNFT(false)
        console.error('failed to nft balance', error)
      })
  }, [address])

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18,
        ),
      }
    })
  }, [memberAddresses, memberTokenAmounts])

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Rinkebyネットワークに切り替えてください</h2>
        <p>このDAppはRinkebyネットワークでのみ動作します。</p>
      </div>
    )
  } else if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to Student Engineer</h1>
        <button onClick={() => connectWallet('injected')} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    )
  } else if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🍣DAO メンバーページ</h1>
        <p>貴方はこのDAOのメンバーです！！</p>
        <div>
          <div>
            <h2>メンバーリスト</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Wallet Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>提案一覧</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                e.stopPropagation()

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true)

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  }
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + '-' + vote.type,
                    )

                    if (elem.checked) {
                      voteResult.vote = vote.type
                      return
                    }
                  })
                  return voteResult
                })

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address)
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address)
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId)
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote)
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return
                      }),
                    )
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(vote.proposalId)

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId)
                          }
                        }),
                      )
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true)
                      // and log out a success message
                      console.log('successfully voted')
                    } catch (err) {
                      console.error('failed to execute votes', err)
                    }
                  } catch (err) {
                    console.error('failed to vote', err)
                  }
                } catch (err) {
                  console.error('failed to delegate tokens')
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false)
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + '-' + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + '-' + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? 'Voting...'
                  : hasVoted
                  ? 'You Already Voted'
                  : 'Submit Votes'}
              </button>
              <small>まとめて署名できます</small>
            </form>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="landing">
        <h1>Mint your free 🍪DAO Membership NFT</h1>
        <button disabled={isClaiming} onClick={() => mintNft()}>
          {isClaiming ? 'Minting...' : 'Mint your nft (FREE)'}
        </button>
      </div>
    )
  }
}

export default App
