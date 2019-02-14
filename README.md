<p align="center">
    <img src="https://raw.githubusercontent.com/deptagency/oppy/master/oppy.png" width="128" height="128" alt="Oppy">
    <br>
    <br>
    <b>Oppy</b><sup>*</sup>
    <br>
    Slack Bot for Personio daily absences
</p>


### Install

```bash
npm install --global @deptagency/oppy
```

*or*

```bash
yarn global add @deptagency/oppy
```


### Usage

```bash
oppy options
```


### Options

Option            | Description
----------------- | -----------
`--personio-ics`  | Personio calendar public url
`--slack-webhook` | Slack incoming webhook url


### Examples

```bash
oppy --personio-ics=https://dept.personio.de/calendar/ical/XXX/XXX/absences/0/calendar.ics
oppy --slack-webhook=https://hooks.slack.com/services/XXX/XXX/XXX
```


### *
[#ThanksOppy](https://twitter.com/hashtag/ThanksOppy)


### Icon
Made by [Freepik](https://www.freepik.com) from [www.flaticon.com](https://www.flaticon.com)
