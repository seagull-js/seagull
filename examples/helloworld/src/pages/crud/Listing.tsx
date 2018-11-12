import { Page } from '@seagull/pages'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { style } from 'typestyle'
import { Term } from '../../items'

const tableCSS = style({ borderCollapse: 'collapse' })
const rowCSS = style({ borderBottom: '1px solid #ccc' })
const columnCSS = style({ textAlign: 'left', padding: 10 })

export default class Listing extends Page {
  title = 'Overview | Glossary'

  html() {
    return (
      <div>
        <Helmet>
          <script src="/instantclick.min.js" data-no-instant />
          <script data-no-instant>InstantClick.init();</script>
        </Helmet>
        <h1>Glossary</h1>
        <hr />
        <form action="/glossary/create" method="POST">
          <input type="text" name="word" placeholder="enter new word..." />
          <textarea name="definition" placeholder="enter definition..." />
          <input type="submit" />
        </form>
        <hr />
        <table className={tableCSS}>
          <thead>
            <tr className={rowCSS}>
              <th className={columnCSS}>Word</th>
              <th className={columnCSS}>Definition</th>
              <th className={columnCSS}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.props.data.list.map((term: Term) => (
              <tr key={term.id} className={columnCSS}>
                <td className={columnCSS}>
                  <a href={`/glossary/${encodeURIComponent(term.id)}`}>
                    {term.id}
                  </a>
                </td>
                <td className={columnCSS}>{term.definition}</td>
                <td className={columnCSS}>
                  <form action="/glossary/delete" method="POST">
                    <input type="hidden" name="word" value={term.id} />
                    <input type="submit" value="delete" />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}
