import { Grid, } from '@material-ui/core'
import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import HighlightCases from '../components/HighlightCases/HighlightCases'
import LoadingProgress from '../components/LoadingProgress/LoadingProgress'
import Region from '../components/Region/Region'
import TimeFrame from '../components/TimeFrame/TimeFrame'
import WarningApi from '../components/WarningApi/WarningApi'
import {
  fetcher,
  sharedReduceCases,
  sharedReduceDeaths,
  sharedReduceRecovered,
  URL_HISTORY_DISTRICT,
  URL_HISTORY_GENERAL_CASES,
  URL_HISTORY_GENERAL_DEATHS,
  URL_HISTORY_GENERAL_GERMANY,
  URL_HISTORY_GENERAL_RECOVERED,
} from '../utility/utility'

const Home = (props: any) => {
  const [period, setPeriod] = useState(0);
  const [district, setDistrict] = useState({ name: '', id: '' });
  const [deutchlandData, setDeutchlandData] = useState({cases: 0, deaths: 0, recovered: 0});
  const [selectedData, setSelectedData] = useState({ title: '', cases: 0, deaths: 0, recovered: 0 });
  const [disableTimeFrameButtons, setDisableTimeFrameButtons] = useState(false);

  const { data, error } = useSWR(URL_HISTORY_GENERAL_GERMANY, fetcher);
  if (error) return <WarningApi />
  if (!data) return <LoadingProgress minHeight="80"/>

  const hightLightGeneralData = typeof district.name === 'undefined' || district.name === '';

  const handleDistrict = (name: string, id: string) => {
    const selectedDistrict = { name, id }
    setDistrict(selectedDistrict);
  }

  const handleTimeFrame = (value: number) => {
    setPeriod(value);
  }

  const handleSelectedData = (name: string, days: number) => {
    props.handleRegion(name);
    props.handlePeriod(days);
  }

  const getDistrictInformation = async () => {
    const districtData =
      await axios.get(`${URL_HISTORY_DISTRICT}${district.id}`)
      .then(res => res.data)
    const fetchInfo = districtData.data[district.id];

    setSelectedData({
      title: district.name,
      cases: fetchInfo.cases,
      deaths: fetchInfo.deaths,
      recovered: fetchInfo.recovered,
    })
  }

  const getPeriodGeralInformation = async () => {
    if (period > 0) {
      setDisableTimeFrameButtons(true);

      const periodCasesData =
        await axios.get(`${URL_HISTORY_GENERAL_CASES}${period}`)
          .then(res => res.data);
      const periodDeathsData =
        await axios.get(`${URL_HISTORY_GENERAL_DEATHS}${period}`)
          .then(res => res.data);
      const periodRecoveredData =
        await axios.get(`${URL_HISTORY_GENERAL_RECOVERED}${period}`)
          .then(res => res.data);

      setDeutchlandData({
        cases: periodCasesData.data.reduce(sharedReduceCases, 0),
        deaths: periodDeathsData.data.reduce(sharedReduceDeaths, 0),
        recovered: periodRecoveredData.data.reduce(sharedReduceRecovered, 0),
      })
    } else {
      handleInitData();
    }

    setDisableTimeFrameButtons(false);
  }

  const getPeriodDistrictInformation = async () => {
    if (period > 0) {
      setDisableTimeFrameButtons(true);

      const periodCasesData =
        await axios.get(`${URL_HISTORY_DISTRICT}${district.id}/history/cases/${period}`)
          .then(res => res.data)
          .catch((error) => {setDisableTimeFrameButtons(false)});
      const periodDeathsData =
        await axios.get(`${URL_HISTORY_DISTRICT}${district.id}/history/deaths/${period}`)
          .then(res => res.data)
          .catch((error) => {setDisableTimeFrameButtons(false)});
      const periodRecoveredData =
        await axios.get(`${URL_HISTORY_DISTRICT}${district.id}/history/recovered/${period}`)
          .then(res => res.data)
          .catch((error) => {setDisableTimeFrameButtons(false)});

      setSelectedData({
        title: district.name,
        cases: periodCasesData.data[district.id].history.reduce(sharedReduceCases, 0),
        deaths: periodDeathsData.data[district.id].history.reduce(sharedReduceDeaths, 0),
        recovered: periodRecoveredData.data[district.id].history.reduce(sharedReduceRecovered, 0),
      })
    } else {
      getDistrictInformation();
    }

    setDisableTimeFrameButtons(false);
  }

  const handleInitData = () => {
    const initData = {
      cases: data.cases,
      deaths: data.deaths,
      recovered: data.recovered,
    }
    setDeutchlandData(initData)
  }

  useEffect(() => {
    handleInitData();
  }, [])

  useEffect(() => {
    district.name && getDistrictInformation();
    hightLightGeneralData ? getPeriodGeralInformation() : getPeriodDistrictInformation();
    handleSelectedData(district.name, period);
  }, [period, district])

  return (
    <>
      <Grid container spacing={2}>
        <HighlightCases
          cases={
            hightLightGeneralData
              ? deutchlandData.cases
              : selectedData.cases
          }
          deaths={
            hightLightGeneralData
              ? deutchlandData.deaths
              : selectedData.deaths
          }
          recovered={
            hightLightGeneralData
              ? deutchlandData.recovered
              : selectedData.recovered
          }

          disabledButton={disableTimeFrameButtons}
        />
      </Grid>
      <div style={{
        marginTop: '5vh',
        padding: '1rem',
        background: 'white'
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={7}>
            <Region districtName={handleDistrict} />
          </Grid>
          <Grid item xs={12} md={6} lg={5}>
            <TimeFrame
              getPeriod={handleTimeFrame}
              disabledButton={disableTimeFrameButtons}
            />
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default Home;


