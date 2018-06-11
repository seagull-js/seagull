import * as React from 'react'

/**
 * Organization of different Organisms to create an abstract page layout
 *
 * Definition: http://atomicdesign.bradfrost.com/outline/#templates
 *
 * Use it like this:
 *
 * ```typescript
 * class ProductListing extends Template<{ products: any[] }> {
 *   state: { searchResults: [] }
 *
 *   render() {
 *     return (
 *       <>
 *       <Navbar />
 *       <Container>
 *         <SearchBar items={this.props.products} />
 *         <Listing items={this.state.searchResults} />
 *       </Container>
 *       <Footer />
 *       </>
 *     )
 *   }
 * }
 * ```
 */
export class Template<P = {}, S = {}> extends React.Component<P, S> {}
