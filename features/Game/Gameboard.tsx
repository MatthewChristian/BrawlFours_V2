import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DeckCard } from '../../models/DeckCard';
import PlayingCard from './PlayingCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getBeg, getDealer, getDoubleLiftCards, getDoubleLiftModalVisible, getGameVolume, getLift, getLiftWinner, getMatchWinner, getMessage, getMobileView, getPlayerCards, getPlayerJoinedRoom, getPlayerList, getPlayerStatus, getRoundWinners, getTeammateCards, getTurn, setDoubleLiftModalVisible, setFocusedCard, setMessage } from '../../slices/game.slice';
import { PlayerSocket } from '../../models/PlayerSocket';
import Modal from '../../core/components/Modal';
import Button from '../../core/components/Button';
import { toast } from 'react-toastify';
import GameInfo from './GameInfo';
import RoundWinnersModal from './Modals/RoundWinnersModal';
import { RoundWinners } from '../../models/RoundWinners';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';
import { CardAbilities } from '../../core/services/abilities';
import Marker from './PositionMarkers/Marker';
import { setPlayer1HandPos, setPlayer2HandPos, setPlayer3HandPos, setPlayer4HandPos } from '../../slices/position.slice';
import PlayerStatusIcons from './PlayerStatusIcons';
import { IoMdEye, IoMdSwap } from 'react-icons/io';
import LoadingIcon from './LoadingIcon';
import ActiveAbilities from './ActiveAbilities';
import Chatbox from './Chatbox';
import MobileGameInfo from './MobileGameInfo';
import { IoChatbox } from 'react-icons/io5';
import SettingsModal from './Modals/SettingsModal';
import LeaveConfirmModal from './Modals/LeaveConfirmModal';
import AllyCardsModal from './Modals/AllyCardsModal';
import { TooltipRefProps } from 'react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import BeggarBegModal from './Modals/BeggarBegModal';
import { getIsAllySelectionModalVisible, getIsOppSelectionModalVisible, setIsAllySelectionModalVisible, setIsBegModalVisible, setIsBegResponseModalVisible, setIsChooseStarterModalVisible, setIsOppSelectionModalVisible, setIsRedealModalVisible, setIsRoundWinnersModalVisible, setIsSwapHandsModalVisible, setIsWaitingBegResponseModalVisible } from '../../slices/modals.slice';
import DealerBegModal from './Modals/DealerBegModal';
import WaitingBegModal from './Modals/WaitingBegModal';
import RedealModal from './Modals/RedealModal';
import TargetPowerlessModal from './Modals/TargetPowerlessModal';
import OppReplayModal from './Modals/OppReplayModal';
import SwapOppCardModal from './Modals/SwapOppCardModal';
import SwapAllyCardModal from './Modals/SwapAllyCardModal';
import SwapAllyCardMobileModal from './Modals/SwapAllyCardMobileModal';
import ChooseStarterModal from './Modals/ChooseStarterModal';
import DoubleLiftModal from './Modals/DoubleLiftModal';
import SwapHandsModal from './Modals/SwapHandsModal';


interface Props {
  roomId?: string;
}


export default function Gameboard({ roomId }: Props) {

  const router = useRouter();

  const dispatch = useAppDispatch();

  const mobileView = useAppSelector(getMobileView);

  const players = useAppSelector(getPlayerList);

  const dealer = useAppSelector(getDealer);

  const playerTurn = useAppSelector(getTurn);

  const begState = useAppSelector(getBeg);

  const message = useAppSelector(getMessage);

  const lift = useAppSelector(getLift);

  const roundWinners = useAppSelector(getRoundWinners);

  const matchWinner = useAppSelector(getMatchWinner);

  const liftWinner = useAppSelector(getLiftWinner);

  const playerJoinedRoom = useAppSelector(getPlayerJoinedRoom);

  const activeAbilities = useAppSelector(getActiveAbilities);

  const playerStatus = useAppSelector(getPlayerStatus);

  const doubleLiftCards = useAppSelector(getDoubleLiftCards);

  const gameVolume = useAppSelector(getGameVolume);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const settingsTooltipRef = useRef<TooltipRefProps>(null);
  const leaveTooltipRef = useRef<TooltipRefProps>(null);

  // Cards in the hand of the client player
  const playerCards = useAppSelector(getPlayerCards);

  // Cards in the hand of the client player's teammate
  const teammateCards = useAppSelector(getTeammateCards);

  // Modal visibility
  const oppSelectionModalVisible = useAppSelector(getIsOppSelectionModalVisible);
  const allySelectionModalVisible = useAppSelector(getIsAllySelectionModalVisible);
  const doubleLiftModalVisible = useAppSelector(getDoubleLiftModalVisible);

  // Selected opponent when choosing opponent from ability
  const [selectedOpp, setSelectedOpp] = useState<PlayerSocket>();

  // Selected card when choosing card from hand from ability
  const [selectedCard, setSelectedCard] = useState<DeckCard>();

  // Selected card when choosing card from ally's hand from ability
  const [selectedAllyCard, setSelectedAllyCard] = useState<DeckCard>();

  // If a card ability allows the player to target a card in the lift
  const [isTargettingLift, setIsTargettingLift] = useState<boolean>(false);

  // If a card ability allows the player to target an opponent's card in the lift
  const [isTargettingOppLift, setIsTargettingOppLift] = useState<boolean>(false);

  // Card that a player played which triggered a target ability
  const [playedCard, setPlayedCard] = useState<DeckCard>();

  // Store round winners in a state to keep round winners stored in case it is wiped from server
  const [roundWinnersStored, setRoundWinnersStored] = useState<RoundWinners>();

  // If looking at teammate's cards face up
  const [isTeammateCardsVisible, setIsTeammateCardsVisible] = useState<boolean>(false);

  // When chat icon is clicked in mobile view
  const [isChatboxExpand, setIsChatboxExpand] = useState<boolean>(false);





  // React refs for player hand div
  const player1Hand = useRef<HTMLDivElement>(null);
  const player2Hand = useRef<HTMLDivElement>(null);
  const player3Hand = useRef<HTMLDivElement>(null);
  const player4Hand = useRef<HTMLDivElement>(null);

  // React states to manage what cards players have
  const [player1Cards, setPlayer1Cards] = useState<DeckCard[]>([]);
  const [player3Cards, setPlayer3Cards] = useState<DeckCard[]>([]);

  const [player1Data, setPlayer1Data] = useState<PlayerSocket>({});
  const [player2Data, setPlayer2Data] = useState<PlayerSocket>({});
  const [player3Data, setPlayer3Data] = useState<PlayerSocket>({});
  const [player4Data, setPlayer4Data] = useState<PlayerSocket>({});

  // Sound effects
  const cardSwipeSfx = useRef<HTMLAudioElement>(null);

  // Data to send to socket
  const socketData = useMemo(() => {
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem('socketId') ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem('socketId', socket.id);
      localId = socket.id;
    }

    return ({
      roomId: roomId ? String(roomId) : undefined,
      localId: localId
    });
  }, [roomId]);

  // Get player number from server
  const playerNumber = useMemo(() => {
    return players.find(el => el.id == socketData.localId)?.player;
  }, [players, socketData]);

  // Determine whether or not it is the turn of the client player
  const isPlayer1Turn = useMemo(() => {
    if (playerNumber == playerTurn) {
      return true;
    }

    return false;
  }, [playerTurn, playerNumber]);

  // Determine whether or not client player is the dealer
  const isPlayer1Dealer = useMemo(() => {
    if (playerNumber == dealer) {
      return true;
    }

    return false;
  }, [dealer, playerNumber]);

  // Get data of player whose turn it is
  const turnPlayerData = useMemo(() => {

    // Reset state
    setPlayedCard(undefined);
    setIsTargettingLift(false);
    setIsTargettingOppLift(false);

    return players.find(el => el.player == playerTurn);
  }, [playerTurn, players]);


  // Get data of dealer
  const dealerData = useMemo(() => {
    return players.find(el => el.player == dealer);
  }, [dealer, players]);

  // Get mapped number of lift winner
  const liftWinnerMapped = useMemo(() => {
    if (!liftWinner || !playerNumber || !players) {
      return undefined;
    }

    const winnerPlayer = players.find(el => el.player == liftWinner)?.player;

    if (player1Data.player == winnerPlayer) {
      return 1;
    }
    else if (player2Data.player == winnerPlayer) {
      return 2;
    }
    else if (player3Data.player == winnerPlayer) {
      return 3;
    }
    else if (player4Data.player == winnerPlayer) {
      return 4;
    }

  }, [liftWinner, players, playerNumber, player1Data, player2Data, player3Data, player4Data]);

  // Lift cards
  const player1CardPlayed = useMemo(() => {
    if (!lift) {
      return undefined;
    }

    return lift.find(el => el.player == playerNumber);
  }, [lift]);

  const player2CardPlayed = useMemo(() => {
    if (!lift || !playerNumber) {
      return undefined;
    }

    const player2Number = playerNumber == 4 ? 1 : playerNumber + 1;

    return lift.find(el => el.player == player2Number);

  }, [lift, playerNumber]);

  const player3CardPlayed = useMemo(() => {
    if (!lift || !playerNumber) {
      return undefined;
    }

    const player3Number = playerNumber + 2 > 4 ? (playerNumber + 2) % 4 : playerNumber + 2;

    return lift.find(el => el.player == player3Number);


  }, [lift, playerNumber]);

  const player4CardPlayed = useMemo(() => {
    if (!lift || !playerNumber) {
      return undefined;
    }

    const player4Number = playerNumber + 3 > 4 ? (playerNumber + 3) % 4 : playerNumber + 3;

    return lift.find(el => el.player == player4Number);

  }, [lift, playerNumber]);


  const player1Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player1Data);
  }, [playerStatus, player1Data]);

  const player2Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player2Data);
  }, [playerStatus, player2Data]);

  const player3Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player3Data);
  }, [playerStatus, player3Data]);

  const player4Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player4Data);
  }, [playerStatus, player4Data]);


  const isForceStandCardInHand: boolean = useMemo(() => {
    let forceStand = false;

    player1Cards.forEach(el => {
      if (el?.ability == CardAbilities.forceStand) {
        forceStand = true;
        return;
      }
    });

    return forceStand;
  }, [player1Cards]);

  const cardWidth = useMemo(() => {
    // Used for mobile view card margins
    return (7.2 * window.innerHeight)/100; // 7.2 is used because width is 3/5 of height which is 12 * window.innerHeight
  }, []);

  const handWidth = useMemo(() => {
    // Used for mobile view card margins
    return (90 * window.innerWidth) / 100;
  }, []);

  const player1CardsOverlapMargins =  useMemo(() => {
    return mobileView ? -((handWidth / cardWidth) * (player1Cards.length / 3.5)) : undefined;
  }, [mobileView, handWidth, cardWidth, player1Cards]);

  const player3CardsOverlapMargins = useMemo(() => {
    return mobileView ? -((handWidth / cardWidth) * (player3Cards.length / 3.5)) : undefined;
  }, [mobileView, handWidth, cardWidth, player3Cards]);

  const player1CardElements = useMemo(() => {
    return (
      <AnimatePresence>
        {
          Array.from({ length: player1Cards.length == 0 ? player1Data?.numCards ?? 0 : player1Cards?.length }, (_, k) => {

            const selectionActive = ((oppSelectionModalVisible || (allySelectionModalVisible && !mobileView)) && (!(player1Cards[k]?.suit == playedCard?.suit && player1Cards[k]?.value == playedCard?.value)));

            return (
              <motion.div
                key={player1Cards[k]?.suit ? ('1_' + (player1Cards[k]?.suit + player1Cards[k]?.value)) : '1_' + k?.toString()}
                layout
                transition={{ type: 'spring', duration: 0.5 }}
                exit={{}}
                style={{ zIndex: selectionActive ? 9999 : 20 }}
              >
                <PlayingCard
                  player={1}
                  cardData={player1Cards[k]}
                  isDeckCard={player1Cards.length == 0 ? true : false}
                  onClickHandler={() => player1Cards.length == 0 ? undefined : selectionActive ? handleSelectCard(player1Cards[k]) : playCard(player1Cards[k])}
                  style={{ marginRight: mobileView ? player1CardsOverlapMargins : '-8px', marginLeft: mobileView ? player1CardsOverlapMargins : '-8px' }}
                  spotlighted={selectionActive}
                  glow={selectionActive ? 'blue' : undefined}
                  spin={true}
                />
              </motion.div>
            );
          }
          )
        }
      </AnimatePresence>
    );
  }, [player1Cards, oppSelectionModalVisible, allySelectionModalVisible, mobileView, playedCard, player1CardsOverlapMargins, player1Data]);

  const player2CardElements = useMemo(() => {
    return (<AnimatePresence>
      {mobileView ? <></> :
        Array.from({ length: player2Data?.numCards ?? 0 }, (_, k) => (
          <motion.div
            key={'2' + k}
            layout
            transition={{ type: 'spring', duration: 0.5 }}
            exit={{}}
          >
            <PlayingCard
              key={'2' + k}
              player={2}
              isDeckCard
              className='rotate-90 p-0'
              style={getTeam2CardMargins(player2Data?.numCards ?? 0)}
              spin={k < player2Data?.spin}
            />
          </motion.div>
        ))

      }

    </AnimatePresence>);
  }, [mobileView, player2Data]);


  const player3CardElements = useMemo(() => {
    return(
      <AnimatePresence>
        {
          mobileView ? <></> :
            Array.from({ length: player3Data?.numCards ?? 0 }, (_, k) => {
              return (
                <motion.div
                  key={player3Cards[k]?.suit ? ('3_' + (player3Cards[k]?.suit + player3Cards[k]?.value)) : '3_' + k?.toString()}
                  layout
                  transition={{ type: 'spring', duration: 0.5 }}
                  exit={{}}
                >
                  <PlayingCard
                    player={3}
                    cardData={player3Cards[k]}
                    isNotPlayable={!allySelectionModalVisible}
                    className='-mx-2 p-0'
                    spotlighted={allySelectionModalVisible}
                    glow={allySelectionModalVisible ? 'blue' : undefined}
                    onClickHandler={() => player3Cards.length == 0 ? undefined : allySelectionModalVisible ? handleSelectAllyCard(player3Cards[k]) : undefined}
                    flipped={!(isTeammateCardsVisible || allySelectionModalVisible)}
                    spin={true}
                  />
                </motion.div>
              );
            })
        }
      </AnimatePresence>
    );
  }, [player3Data, mobileView, allySelectionModalVisible, player3Cards, isTeammateCardsVisible]);

  const player4CardElements = useMemo(() => {
    return (<AnimatePresence>
      {mobileView ? <></> :

        Array.from({ length: player4Data?.numCards ?? 0 }, (_, k) => (
          <motion.div
            key={'4' + k}
            layout
            transition={{ type: 'spring', duration: 0.5 }}
            exit={{}}
          >
            <PlayingCard
              player={4}
              isDeckCard
              className='rotate-90 p-0'
              style={getTeam2CardMargins(player4Data?.numCards ?? 0)}
              spin={k < player4Data?.spin}
            />
          </motion.div>
        ))
      }
    </AnimatePresence>);
  }, [mobileView, player4Data]);



  function getPlayerStatuses(playerData: PlayerSocket) {
    if (!playerStatus) {
      return [];
    }

    const index = playerStatus.findIndex(el => el?.player?.player == playerData?.player);
    if (index == -1) {
      return [];
    }

    return playerStatus[index]?.status ?? [];
  }

  function getTeam2CardMargins(length: number) {
    return ({
      marginTop: (-6 + (length / 3) - 2) * length,
      marginBottom: (-6 + (length / 3) - 2) * length
    });
  }

  /*
    Render player cards on the screen
  */
  function displayPlayerCards(player: DeckCard[]) {
    setPlayer1Cards(player);
  }


  function playCard(card: DeckCard) {

    if (!isPlayer1Turn) {
      return;
    }

    // Check if abilities/royals are disabled before applying/sending ability data to server
    const areAbilitiesDisabled = activeAbilities?.includes(CardAbilities.abilitiesDisabled);

    if (!card.playable) {
      return;
    }

    if (!areAbilitiesDisabled) {
      if (card.ability == CardAbilities.swapOppCard) {
        if (player2Data.numCards && player4Data.numCards && player1Cards?.length && player1Cards.length != 1 && player2Data.numCards != 0 && player4Data.numCards != 0) {
          dispatch(setIsOppSelectionModalVisible(true));
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.swapAllyCard) {
        if (player3Data.numCards && player1Cards?.length && player1Cards.length != 1 && player3Data.numCards != 0) {
          dispatch(setIsAllySelectionModalVisible(true));
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.targetPowerless) {
        if (lift && lift.length != 0) {
          setIsTargettingLift(true);
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.oppReplay) {
        if (lift && lift.length != 0) {
          setIsTargettingOppLift(true);
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.chooseStarter) {
        if (player1Cards?.length > 1) {
          dispatch(setIsChooseStarterModalVisible(true));
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.swapHands) {
        if (player1Cards?.length > 1) {
          dispatch(setIsSwapHandsModalVisible(true));
          setPlayedCard(card);
          return;
        }
      }

    }


    socket.emit('playCard', { ...socketData, card: { ...card, ability: areAbilitiesDisabled ? undefined : card.ability }, player: playerNumber });
  }

  function handleLiftCardClick(card: DeckCard) {

    if (isTargettingLift) {
      socket.emit('targetPowerless', { ...socketData, card: card, player: playerNumber, playedCard: playedCard });
    }
    else if (isTargettingOppLift) {
      socket.emit('oppReplay', { ...socketData, card: card, player: playerNumber, playedCard: playedCard });
    }

  }

  function handleSelectCard(card: DeckCard) {
    if (card.suit == playedCard?.suit && card.value == playedCard?.value) {
      return;
    }

    setSelectedCard(card);
  }

  function handleSelectAllyCard(card: DeckCard) {
    setSelectedAllyCard(card);
  }

  function handleOppSelectionConfirm() {
    socket.emit('swapOppCard', { ...socketData, card: selectedCard, player: playerNumber, target: selectedOpp, playedCard: playedCard,  });
    handleOppSelectionClose();
  }

  function handleOppSelectionClose() {
    dispatch(setIsOppSelectionModalVisible(false));
    setPlayedCard(undefined);
    setSelectedOpp(undefined);
    setSelectedCard(undefined);
  }

  function handleAllySelectionConfirm() {
    socket.emit('swapAllyCard', { ...socketData, card: selectedCard, allyCard: selectedAllyCard, player: playerNumber, playedCard: playedCard, });
    handleAllySelectionClose();
  }

  function handleAllySelectionClose() {
    dispatch(setIsAllySelectionModalVisible(false));
    setPlayedCard(undefined);
    setSelectedCard(undefined);
    setSelectedAllyCard(undefined);
  }

  function handleChooseStarterConfirm() {
    socket.emit('chooseStarter', { ...socketData, player: playerNumber, target: selectedOpp, playedCard: playedCard });
    handleChooseStarterModalClose();
  }

  function handleChooseStarterModalClose() {
    dispatch(setIsChooseStarterModalVisible(false));
    setPlayedCard(undefined);
    setSelectedOpp(undefined);
  }

  function handleSwapHandsConfirm() {
    socket.emit('swapHands', { ...socketData, player: playerNumber, target: selectedOpp, playedCard: playedCard });
    handleSwapHandsModalClose();
  }

  function handleSwapHandsModalClose() {
    dispatch(setIsSwapHandsModalVisible(false));
    setPlayedCard(undefined);
    setSelectedOpp(undefined);
  }

  useEffect(() => {
    displayPlayerCards(playerCards ?? []);
  }, [playerCards]);

  useEffect(() => {
    setPlayer3Cards(teammateCards ?? []);
  }, [teammateCards]);


  // Join room
  useEffect(() => {
    if (!socketData?.roomId) {
      router.push('/');
      toast('Sorry, this room does not exist!', {
        type: 'error',
        hideProgressBar: true
      });
      return;
    }

    socket?.emit('joinRoom', socketData);
  }, [socketData]);


  // Initialise game
  useEffect(() => {
    if (playerJoinedRoom) {
      socket.emit('initialiseGame', socketData);
    }
  }, [socketData, playerJoinedRoom]);



  // Set player data
  useEffect(() => {

    if (!players || players.length == 0 || !playerNumber) {
      return;
    }

    const playerDataServer: PlayerSocket[] = [];

    players.forEach((el) => {
      if (el.player) {
        playerDataServer[el.player] = el;
      }
    });

    setPlayer1Data(playerDataServer[playerNumber]);

    if (playerNumber == 1) {
      setPlayer2Data(playerDataServer[2]);

      setPlayer3Data(playerDataServer[3]);

      setPlayer4Data(playerDataServer[4]);
    }
    else if (playerNumber == 2) {
      setPlayer2Data(playerDataServer[3]);

      setPlayer3Data(playerDataServer[4]);

      setPlayer4Data(playerDataServer[1]);
    }
    else if (playerNumber == 3) {
      setPlayer2Data(playerDataServer[4]);

      setPlayer3Data(playerDataServer[1]);

      setPlayer4Data(playerDataServer[2]);
    }
    else if (playerNumber == 4) {
      setPlayer2Data(playerDataServer[1]);

      setPlayer3Data(playerDataServer[2]);

      setPlayer4Data(playerDataServer[3]);
    }

  }, [players, playerNumber]);

  // Manage round winner modal
  useEffect(() => {
    if (roundWinners) {
      dispatch(setIsRoundWinnersModalVisible(true));
      setRoundWinnersStored(roundWinners);
    }
  }, [roundWinners]);

  // Manage beg modals
  useEffect(() => {
    if (!begState) {
      return;
    }

    if (begState == 'begged') {
      if (isPlayer1Dealer) {
        dispatch(setIsBegResponseModalVisible(true));
      }
      else if (isPlayer1Turn) {
        dispatch(setIsBegModalVisible(false));
        dispatch(setIsWaitingBegResponseModalVisible(true));
      }
    }
    else if (begState == 'stand') {
      dispatch(setIsBegModalVisible(false));
    }
    else if (begState == 'give') {
      dispatch(setIsBegResponseModalVisible(false));
      dispatch(setIsWaitingBegResponseModalVisible(false));
    }
    else if (begState == 'run') {
      dispatch(setIsBegResponseModalVisible(false));
      dispatch(setIsWaitingBegResponseModalVisible(false));
    }
    else if (begState == 'begging') {
      dispatch(setIsRedealModalVisible(false));

      if (isPlayer1Turn) {
        dispatch(setIsBegModalVisible(true));
      }
    }
  }, [begState, isPlayer1Dealer, isPlayer1Turn, turnPlayerData, dealerData]);



  useEffect(() => {
    if (message) {
      if (isPlayer1Dealer && message.shortcode == 'REDEAL') {
        dispatch(setIsRedealModalVisible(true));
      }
      else if (
        isPlayer1Dealer && message.shortcode == 'GIVE'
        || (isPlayer1Turn || isPlayer1Dealer) && message.shortcode == 'BEGGED'
        || isPlayer1Dealer && message.shortcode == 'RUN'
      ) {
        //
      }
      else {
        toast(message.message, {
          type: 'default',
          hideProgressBar: true,
          position: 'top-center'
        });
      }

      dispatch(setMessage(undefined));
    }
  }, [message, isPlayer1Dealer, isPlayer1Turn]);

  useEffect(() => {
    if (matchWinner) {
      router.push(`/?roomId=${String(roomId)}`);
    }

    if (roomId) {
      setIsLoading(false);
    }
  }, [matchWinner, roomId]);

  useEffect(() => {
    if (!cardSwipeSfx?.current) {
      return;
    }

    console.log('Vol: ', gameVolume);

    const volume = gameVolume ?? 0.5;

    cardSwipeSfx.current.volume = volume;
  }, [gameVolume]);

  useEffect(() => {
    if (player1CardPlayed || player2CardPlayed || player3CardPlayed || player4CardPlayed) {
      cardSwipeSfx?.current?.play();
    }
  }, [player1CardPlayed, player2CardPlayed, player3CardPlayed, player4CardPlayed]);


  return (
    <div className="h-full w-screen">

      <audio ref={cardSwipeSfx} src="/sounds/card_swipe.ogg"></audio>

      <div className={`flex ${mobileView ? 'flex-col' : 'flex-row'}`}>

        {mobileView ?
          <div className='h-[15dvh]'>
            <MobileGameInfo playerTeam={player1Data.team} />
          </div> :
          <div className='w-1/5 z-[9999]'>
            <GameInfo playerTeam={player1Data.team} socketData={socketData} settingsTooltipRef={settingsTooltipRef} leaveTooltipRef={leaveTooltipRef} />
          </div>
        }

        <div className={`board-bg flex flex-col justify-between  ${mobileView ? 'h-[70dvh] w-full' : 'h-[100dvh] w-4/5'}`}>
          {
            isLoading ?
              <div className='w-full h-full flex justify-center items-center'>
                <LoadingIcon />
              </div>
              :
              <>

                {/* ------------------------ Player 3 Info  ------------------------*/}
                <div className={`${mobileView ? 'h-1/5' : 'h-1/4'} flex flex-col justify-between items-center`}>
                  <div className='flex flex-row w-full justify-center gap-5 items-center'>

                    <div className='mx-2'>
                      {
                        mobileView &&
                          <AllyCardsModal
                            disabled={!player3Cards.length || player3Cards?.length <= 0}
                            name={player3Data.nickname}
                            cards={player3Cards}
                            player3CardsOverlapMargins={player3CardsOverlapMargins}
                          />
                      }
                    </div>

                    <div className={`flex flex-col items-center justify-center p-2 player-info player-3-info ${mobileView ? 'w-3/4' : 'w-1/2'}`}>
                      <div className={`flex justify-center ${player3Data.disconnected ? 'text-gray-400 italic' : 'text-white'}`}>
                        {
                          player3Data.nickname
                        }
                      </div>


                      <PlayerStatusIcons
                        className='flex flex-row gap-2 min-h-7'
                        playerStatus={player3Status}
                        dealerData={dealerData}
                        turnPlayerData={turnPlayerData}
                        playerData={player3Data}
                      />

                    </div>
                  </div>

                  <div className='w-full flex flex-row justify-center items-center relative'>
                    <div className={`flex flex-row justify-center items-center relative ${player3Cards?.length > 0 ? 'left-5' : ''} ${allySelectionModalVisible ? 'z-[9999]' : ''}`} ref={player3Hand}>
                      {player3CardElements}
                      <Marker dispatchFunction={setPlayer3HandPos} />
                    </div>

                    { player3Cards?.length > 0 && !mobileView &&
                      <div className='flex justify-center items-center relative left-10'>
                        <Button
                          className='blue-button blue-outline'
                          iconClassName=''
                          icon={<IoMdEye />}
                          onClick={() => setIsTeammateCardsVisible((prev) => !prev)}
                        />
                      </div>
                    }
                  </div>
                </div>
                {/* -----------------------------------------------------------------*/}




                <div className='flex flex-row items-center'>
                  {/* ------------------------ Player 4 Info  ------------------------*/}
                  <div className={`flex flex-col justify-center items-center ${mobileView ? 'w-2/5 h-3/4' : 'w-2/12 h-full'} player-info player-4-info`}>
                    <div className={`break-all px-2 text-center ${player4Data.disconnected ? 'text-gray-400 italic' : 'text-white'} px-2`}>
                      {
                        player4Data.nickname
                      }
                    </div>


                    <PlayerStatusIcons
                      className='flex flex-row justify-center flex-wrap gap-2'
                      playerStatus={player4Status}
                      dealerData={dealerData}
                      turnPlayerData={turnPlayerData}
                      playerData={player4Data}
                    />

                  </div>
                  <div className="w-1/6 flex flex-col items-center justify-center gap-0" ref={player4Hand}>
                    {player4CardElements}
                    <Marker dispatchFunction={setPlayer4HandPos} />
                  </div>
                  {/* -----------------------------------------------------------------*/}





                  {/* ------------------------ Lift Info  ------------------------*/}
                  <div className='w-4/6 flex flex-col gap-1 my-2 items-center justify-center'>

                    <PlayingCard
                      cardData={player3CardPlayed}
                      isOutline
                      isNotPlayable={!isTargettingLift}
                      liftCard={3}
                      liftWinner={liftWinnerMapped}
                      onClickHandler={handleLiftCardClick}
                      spotlighted={isTargettingLift}
                    />

                    <div className='flex flex-row'>
                      <PlayingCard
                        cardData={player4CardPlayed}
                        isOutline
                        isNotPlayable={!(isTargettingLift || isTargettingOppLift)}
                        liftCard={4}
                        liftWinner={liftWinnerMapped}
                        onClickHandler={handleLiftCardClick}
                        spotlighted={isTargettingLift || isTargettingOppLift}
                      />

                      {
                        mobileView ? <div className='w-5'></div>:
                          <div className='w-32 px-2 flex flex-wrap justify-center items-center gap-2'>
                            <ActiveAbilities />
                          </div>
                      }

                      <PlayingCard
                        cardData={player2CardPlayed}
                        isOutline
                        isNotPlayable={!(isTargettingLift || isTargettingOppLift)}
                        liftCard={2}
                        liftWinner={liftWinnerMapped}
                        onClickHandler={handleLiftCardClick}
                        spotlighted={isTargettingLift || isTargettingOppLift}
                      />
                    </div>


                    <PlayingCard
                      cardData={player1CardPlayed}
                      isOutline
                      isNotPlayable={!isTargettingLift}
                      liftCard={1}
                      liftWinner={liftWinnerMapped}
                      spotlighted={isTargettingLift}
                    />


                  </div>
                  {/* -------------------------------------------------------------*/}





                  {/* ------------------------ Player 2 Info  ------------------------*/}
                  <div className="w-1/6 flex flex-col items-center justify-center gap-0" ref={player2Hand}>
                    {player2CardElements}
                    <Marker dispatchFunction={setPlayer2HandPos} />
                  </div>
                  <div className={`flex flex-col justify-center items-center ${mobileView ? 'w-2/5 h-3/4' : 'w-2/12 h-full'} player-info player-2-info`}>
                    <div className={`break-all px-2 text-center ${player2Data.disconnected ? 'text-gray-400 italic' : 'text-white'} px-2`}>
                      {
                        player2Data.nickname
                      }
                    </div>

                    <PlayerStatusIcons
                      className='flex flex-row justify-center flex-wrap gap-2'
                      playerStatus={player2Status}
                      dealerData={dealerData}
                      turnPlayerData={turnPlayerData}
                      playerData={player2Data}
                    />

                  </div>
                  {/* -----------------------------------------------------------------*/}
                </div>






                {/* ------------------------ Player 1 Info  ------------------------*/}
                <div className={`${mobileView ? 'h-1/2' : 'h-1/4'} gap-1 flex flex-col justify-end items-center`}>

                  <motion.div className="w-full flex flex-row justify-center items-center" ref={player1Hand}>
                    {player1CardElements}
                    <Marker dispatchFunction={setPlayer1HandPos} />
                  </motion.div>

                  <div className='flex flex-row w-full justify-center gap-5 items-center'>
                    <div className='mx-2'>
                      {
                        mobileView ?
                          <Button
                            className='blue-button'
                            iconClassName='relative '
                            icon={<IoChatbox size={20} />}
                            tooltip='Chat'
                            tooltipAnchor='chat'
                            onClick={() => setIsChatboxExpand(true)}
                          /> : undefined
                      }
                    </div>

                    <div className={`flex flex-col items-center justify-center p-2 player-info player-1-info ${mobileView ? 'w-3/4' : 'w-1/2'}`}>

                      <div className='text-white'>
                        {
                          player1Data.nickname
                        }
                      </div>

                      <PlayerStatusIcons
                        className='flex flex-row gap-2 min-h-7'
                        playerStatus={player1Status}
                        dealerData={dealerData}
                        turnPlayerData={turnPlayerData}
                        playerData={player1Data}
                      />

                    </div>


                  </div>
                </div>
                {/* -----------------------------------------------------------------*/}
              </>
          }
        </div>

        { mobileView ?
          <div className='h-[15dvh] info-bg'>
            <Chatbox socketData={socketData} hideInput expand={isChatboxExpand} setExpand={setIsChatboxExpand} isMobileChat/>
          </div>
          : <></>
        }


      </div>


      {/* ------------------------ Modals ------------------------*/}
      <SettingsModal roomId={socketData.roomId} settingsTooltipRef={settingsTooltipRef} />

      <LeaveConfirmModal socketData={socketData} leaveTooltipRef={leaveTooltipRef} />

      <RoundWinnersModal players={players} roundWinners={roundWinnersStored} />

      {/* ----- Beggar Beg Modal -----*/}
      <BeggarBegModal socketData={socketData} />

      {/* ----- Dealer Beg Modal -----*/}
      <DealerBegModal socketData={socketData} turnPlayerData={turnPlayerData} isForceStandCardInHand={isForceStandCardInHand} />

      {/* ----- Waiting Beg Modal -----*/}
      <WaitingBegModal dealerData={dealerData} />

      {/* ----- Buss Pack Modal -----*/}
      <RedealModal socketData={socketData} />

      {/* ----- targetPowerless Modal -----*/}
      <TargetPowerlessModal isTargettingLift={isTargettingLift} setIsTargettingLift={setIsTargettingLift} setPlayedCard={setPlayedCard} />

      {/* ----- oppReplay Modal -----*/}
      <OppReplayModal isTargettingOppLift={isTargettingOppLift} setIsTargettingOppLift={setIsTargettingOppLift} setPlayedCard={setPlayedCard} />

      {/* ----- swapOppCard Modal -----*/}
      <SwapOppCardModal
        handleOppSelectionClose={handleOppSelectionClose}
        handleOppSelectionConfirm={handleOppSelectionConfirm}
        setSelectedOpp={setSelectedOpp}
        player2Data={player2Data}
        player4Data={player4Data}
        selectedCard={selectedCard}
        selectedOpp={selectedOpp}
      />


      {/* ----- swapAllyCard Modal (Desktop) -----*/}
      <SwapAllyCardModal
        handleAllySelectionClose={handleAllySelectionClose}
        handleAllySelectionConfirm={handleAllySelectionConfirm}
        selectedAllyCard={selectedAllyCard}
        selectedCard={selectedCard}
      />


      {/* ----- swapAllyCard Modal (Mobile) -----*/}
      <SwapAllyCardMobileModal
        handleAllySelectionClose={handleAllySelectionClose}
        handleAllySelectionConfirm={handleAllySelectionConfirm}
        selectedAllyCard={selectedAllyCard}
        selectedCard={selectedCard}
        handleSelectAllyCard={handleSelectAllyCard}
        handleSelectCard={handleSelectCard}
        playedCard={playedCard}
        player1Cards={player1Cards}
        player3Cards={player3Cards}
        player3Data={player3Data}
      />


      {/* ----- chooseStarter Modal -----*/}
      <ChooseStarterModal
        handleChooseStarterClose={handleChooseStarterModalClose}
        handleChooseStarterConfirm={handleChooseStarterConfirm}
        setSelectedOpp={setSelectedOpp}
        selectedOpp={selectedOpp}
        player1Data={player1Data}
        player2Data={player2Data}
        player3Data={player3Data}
        player4Data={player4Data}
      />


      {/* ----- doubleLift Modal -----*/}
      <DoubleLiftModal />


      {/* ----- swapHands Modal -----*/}
      <SwapHandsModal
        handleSwapHandsClose={handleSwapHandsModalClose}
        handleSwapHandsConfirm={handleSwapHandsConfirm}
        setSelectedOpp={setSelectedOpp}
        selectedOpp={selectedOpp}
        player2Data={player2Data}
        player3Data={player3Data}
        player4Data={player4Data}
      />



      {/* -----------------------------------------------------------*/}

    </div>
  );
}